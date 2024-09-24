"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  createTimerWithNotionDatabaseInfo,
  syncDatabase,
} from "@/action/timerAction";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreateTimerSchema } from "@/zodSchema/CreateTimerSchema";
import { z } from "zod";
import RefreshIcon from "../RefreshIcon";
import { Spinner } from "../Spinner";
import { ORIGIN } from "@/lib/constant";
import { toast, useSonner } from "sonner";
import Link from "next/link";

const CreateTimerDatabase = ({
  userNotionInfo,
}: {
  userNotionInfo: { id: string; workspace_name: string }[];
}) => {
  const [userNotionInfoState, setUserNofionInfoState] =
    useState<{ id: string; workspace_name: string }[]>(userNotionInfo);
  const selectedWorkspaceRef = useRef(null);
  const databaseNameRef = useRef(""); // 이거 받아온 걸로 바꿔줘야함.
  const [databaseNameState, setDatabaseNameState] = useState<string>(""); // 이거 받아온 걸로 바꿔줘야함.
  const [databaseIdState, setDatabaseIdState] = useState<string>(""); //  이거도 받아온 걸로 바꿔줘야함.
  const [databaseUrlState, setDatabaseUrlState] = useState<string>("");
  const [notionInfoIdState, setNotionInfoIdState] = useState<string>("");

  const [databaseInfoState, setDatabaseInfoState] = useState<
    { id: string; title: string; url: string }[]
  >([]);
  // const [notionInfoIdState, setNotionInfoIdState] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const databaseIsLoadingRef = useRef(false);
  const syncButtonIsLoadingRef = useRef(false);
  const [databaseIsLoadingState, setDatabaseIsLoadingState] = useState(false);
  const notionInfoIdRef = useRef("");
  const isLoadingRef = useRef(false);
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

  const form = useForm<z.infer<typeof CreateTimerSchema>>({
    resolver: zodResolver(CreateTimerSchema),
    defaultValues: {
      name: "",
      databaseName: databaseNameState,
      notionInfoId: "",
      databaseId: "",
    },
  });

  async function onSubmit(data: z.infer<typeof CreateTimerSchema>) {
    // 따닥 방지하기!
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    setIsLoading(true);
    reRender();
    const result = await createTimerWithNotionDatabaseInfo(
      data.name,
      data.notionInfoId,
      data.databaseId,
      data.databaseName
    );

    if (result.success === true && result.createdTimerId) {
      toast.success("Timer Created!!!", {});
      // isLoadingRef.current = false;
      // setIsLoading(false);
      // reRender();
      // revalidatePath("/my-timers");
      router.push(`/edit-timer/${result.createdTimerId}`);
      return;
    }

    toast.error("Sorry. Something wrong. please try again 🙏");

    isLoadingRef.current = false;
    setIsLoading(false);
    reRender();
  }

  const refreshDatabaseList = async (notionInfoId: string) => {
    if (databaseIsLoadingRef.current) {
      return;
    }
    databaseIsLoadingRef.current = true;
    setDatabaseIsLoadingState(true);
    setIsLoading(true);
    reRender();
    try {
      const res = await fetch(
        `${ORIGIN}/notion/api/database?notionInfoId=${notionInfoId}`
      );

      if (!res.ok) {
        alert("err occur please try again");
        router.refresh();
      }
      const databaseList = await res.json();

      const list = databaseList.databaseList;
      setDatabaseInfoState(list);
    } catch (err) {
      console.log("err : ", err);
      toast.error("Sorry Something Wrong. Please Try Again");
      router.refresh();
    } finally {
      databaseIsLoadingRef.current = false;
      setDatabaseIsLoadingState(false);
      setIsLoading(false);
      reRender();
    }
  };

  /**
   * Notion Database의 Sync를 맞춰주기. notion Database의 Property를 Name : title type, Date : date type으로 바꿔준다.
   * @returns
   */
  const handleSyncDatabase = async () => {
    if (syncButtonIsLoadingRef.current) {
      return;
    }
    syncButtonIsLoadingRef.current = true;
    setIsLoading(true);
    reRender();

    const result = await syncDatabase(notionInfoIdState, databaseIdState);
    if (result?.success) {
      toast.success("Database Synchronized");
    }

    syncButtonIsLoadingRef.current = false;
    setIsLoading(false);
    reRender();
  };

  return (
    <div className="relative">
      <Card
        className={`relative ${
          isLoading ? "filter blur-sm pointer-events-none" : ""
        }`}
      >
        <CardHeader>
          <CardTitle>Connect Notion Database</CardTitle>
          <CardDescription>Notion Database Connect</CardDescription>
        </CardHeader>
        <CardContent>
          {userNotionInfoState.length === 0 ? (
            <div>
              <Button onClick={handleLinkClick}>Notion Connect</Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
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
                            setNotionInfoIdState(event);
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
                              setDatabaseIdState(event);
                              let databaseName = "";
                              let databaseUrl = "";
                              for (
                                let i = 0;
                                i < databaseInfoState.length;
                                i++
                              ) {
                                if (databaseInfoState[i].id === event) {
                                  databaseName = databaseInfoState[i].title;
                                  databaseUrl = databaseInfoState[i].url;
                                  break;
                                }
                              }
                              form.setValue("databaseName", databaseName);
                              form.setValue("name", databaseName);
                              setDatabaseUrlState(databaseUrl);
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
                          database in Notion, click the &apos;...&apos; button
                          in the top-right corner → Connections → Add
                          connections → Focus&Record.
                          {/* <Link href="/examples/forms">email settings</Link>. */}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {databaseIdState && databaseUrlState && notionInfoIdState ? (
                  <div>
                    <p>
                      ⚠️ The database must include a Name property of type
                      &apos;title&apos; and a Date property of type
                      &apos;date&apos;
                    </p>
                    <Button
                      onClick={handleSyncDatabase}
                      type="button"
                      disabled={syncButtonIsLoadingRef.current}
                    >
                      {syncButtonIsLoadingRef.current === true ? (
                        <Spinner />
                      ) : (
                        "Sync Database"
                      )}
                    </Button>
                    <Link
                      href={databaseUrlState}
                      target="_blank"
                      className="bg-blue-200"
                    >
                      Check Database
                    </Link>
                  </div>
                ) : (
                  <></>
                )}

                <Button type="submit">Create Timer ⏰</Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
      {/* 스피너를 화면 위에 고정 */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-t-transparent border-black rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default CreateTimerDatabase;
