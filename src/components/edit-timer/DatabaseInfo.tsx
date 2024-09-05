"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { getNotionInfo, upsertNotionDatabaseInfo } from "@/action/timerAction";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Link } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { NotionDatabaseInfoSchema } from "@/zodSchema/NotionDatabaseInfoSchema";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import RefreshIcon from "../RefreshIcon";
import { Spinner } from "../Spinner";
import { ORIGIN } from "@/lib/constant";
import { useSonner } from "sonner";
import { Input } from "../ui/input";

const DatabaseInfo = ({
  timerId,
  userNotionInfo,
}: {
  timerId: string;
  userNotionInfo: { id: string; workspace_name: string }[];
}) => {
  const [userNotionInfoState, setUserNofionInfoState] =
    useState<{ id: string; workspace_name: string }[]>(userNotionInfo);
  const selectedWorkspaceRef = useRef(null);
  const databaseNameRef = useRef(""); // 이거 받아온 걸로 바꿔줘야함.
  const [databaseNameState, setDatabaseNameState] = useState<string>(""); // 이거 받아온 걸로 바꿔줘야함.

  const [databaseInfoState, setDatabaseInfoState] = useState<
    { id: string; title: string }[]
  >([]);
  // const [notionInfoIdState, setNotionInfoIdState] = useState<string>('');

  const databaseIsLoadingRef = useRef(false);
  const [databaseIsLoadingState, setDatabaseIsLoadingState] = useState(false);
  const notionInfoIdRef = useRef("");
  const router = useRouter();
  // -----------------------------------

  function useReRenderer() {
    const [, setState] = useState({});
    return useCallback(() => setState({}), []);
  }
  const reRender = useReRenderer();

  const fetchAndUpdateNotionInfo = async () => {
    const supabase = createClient();
    const user = await supabase.auth.getUser();

    if (!user.data.user) {
      router.push("/pleanse-login");
    }
    const { data, error } = await supabase
      .from("notion_info")
      .select("id, workspace_name")
      .eq("user_id", user.data.user!.id)
      .is("deleted_at", null); // access_token, workspace_id, database_id는 극비로 한다. 극도로 조심해서 다뤄야 함.

    setUserNofionInfoState(data ? data : []);

    console.log("fetchAndUpdate");
  };

  /**
   * 노션 써드파티 연결
   */
  const handleLinkClick = () => {
    const newWindow = window.open("/notion-connect", "_blank");

    if (newWindow) {
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data === "success") {
          // alert("성공!!!!!!!!");
          await fetchAndUpdateNotionInfo();
        }
        newWindow.close();
        window.removeEventListener("message", handleMessage);
      };
      window.addEventListener("message", handleMessage);
    }
  };

  const form = useForm<z.infer<typeof NotionDatabaseInfoSchema>>({
    resolver: zodResolver(NotionDatabaseInfoSchema),
    defaultValues: {
      timerId: timerId,
      databaseName: databaseNameState,
      notionInfoId: "",
      databaseId: "",
    },
  });

  async function onSubmit(data: z.infer<typeof NotionDatabaseInfoSchema>) {
    // toast({
    //   title: "You submitted the following values:",
    //   description: (
    //     <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // });

    const result = await upsertNotionDatabaseInfo(
      data.timerId,
      data.notionInfoId,
      data.databaseId,
      data.databaseName
    );

    console.log("result : ", result);
    if (JSON.parse(result).success) {
      router.refresh();
    }
  }

  const refreshDatabaseList = async (notionInfoId: string) => {
    if (databaseIsLoadingRef.current) {
      return;
    }
    databaseIsLoadingRef.current = true;
    setDatabaseIsLoadingState(true);
    reRender();
    const res = await fetch(
      `${ORIGIN}/notion/api/database?notionInfoId=${notionInfoId}`
    );

    if (!res.ok) {
      alert("err occur please try again");
      router.refresh();
    }
    const databaseList = await res.json();
    console.log("Client - databaseList : ", databaseList);
    console.log("databaseIsLoading.current : ", databaseIsLoadingRef.current);

    const list = databaseList.databaseList;
    setDatabaseInfoState(list);
    databaseIsLoadingRef.current = false;
    setDatabaseIsLoadingState(false);
    reRender();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database</CardTitle>
        <CardDescription>Database Connected Timer</CardDescription>
      </CardHeader>
      <CardContent>
        {userNotionInfoState.length === 0 ? (
          <div>
            <p>Notion is Not Connected</p>
            <Button onClick={handleLinkClick}>Notion Connect</Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-2/3 space-y-6"
            >
              {/* Workspace */}
              <FormField
                control={form.control}
                name="notionInfoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Select
                        onValueChange={(event) => {
                          field.onChange(event);
                          // notionInfo Id를 가지고 그 안에 있는 accessToken을 가지고 노션 api에 database 목록을 요청해야한다.
                          refreshDatabaseList(event);
                          notionInfoIdRef.current = event;
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a workspace to connect" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userNotionInfoState.map((el) => (
                            <SelectItem key={el.id} value={el.id}>
                              {el.workspace_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant={"ghost"} onClick={handleLinkClick}>
                        +
                      </Button>
                    </div>
                    <FormDescription>
                      Notion Workspace that connect to Timer
                      {/* <Link href="/examples/forms">email settings</Link>. */}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Database */}
              <FormField
                control={form.control}
                name="databaseId"
                render={({ field }) => {
                  return (
                    <FormItem className="relative">
                      <FormLabel>Database</FormLabel>
                      <div className="flex items-center space-x-2">
                        <Select
                          onValueChange={(event) => {
                            field.onChange(event);
                            setDatabaseNameState(event);
                            let databaseName = "";
                            for (let i = 0; i < databaseInfoState.length; i++) {
                              if (databaseInfoState[i].id === event) {
                                databaseName = databaseInfoState[i].title;
                                break;
                              }
                            }
                            form.setValue("databaseName", databaseName);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl className="flex-grow">
                            <SelectTrigger>
                              <SelectValue placeholder="Select a Database to connect to Timer" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {databaseInfoState.map((el) => (
                              <SelectItem key={el.id} value={el.id}>
                                {el.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          disabled={databaseIsLoadingRef.current}
                          className="ml-4"
                          variant={"ghost"}
                          onClick={() => {
                            if (notionInfoIdRef.current) {
                              refreshDatabaseList(notionInfoIdRef.current);
                            }
                          }}
                        >
                          {databaseIsLoadingRef.current === true ? (
                            <Spinner />
                          ) : (
                            <RefreshIcon />
                          )}
                        </Button>
                      </div>
                      <FormDescription>
                        Connect your databases with Focus&Record: open a
                        database in Notion, click the &apos;...&apos; button in
                        the top-right corner → Connections → Add connections →
                        Focus&Record.
                        {/* <Link href="/examples/forms">email settings</Link>. */}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Timer Id */}
              <FormField
                control={form.control}
                name="timerId"
                render={({ field }) => (
                  <Input {...field} type="hidden" value={timerId} />
                )}
              />
              {/* Database Name */}
              {/* <FormField
                control={form.control}
                name="databaseName"
                render={({ field }) => (
                  <Input {...field} type="hidden" value={field.value} />
                )}
              /> */}

              <Button type="submit">Submit</Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseInfo;
