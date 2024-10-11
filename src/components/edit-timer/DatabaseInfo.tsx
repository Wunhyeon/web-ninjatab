"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button, buttonVariants } from "../ui/button";
import { syncDatabase, upsertNotionDatabaseInfo } from "@/action/timerAction";
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
import { NotionDatabaseInfoSchema } from "@/zodSchema/NotionDatabaseInfoSchema";
import { z } from "zod";
import RefreshIcon from "../RefreshIcon";
import { Spinner } from "../Spinner";
import { ORIGIN } from "@/lib/constant";
import { toast } from "sonner";
import { Input } from "../ui/input";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import {
  EDIT_TIMER_CHECK_DATABASE,
  EDIT_TIMER_DATABASE_REFRESH,
  EDIT_TIMER_DATABASE_SELECT,
  EDIT_TIMER_DATABASE_UPDATE_BTN,
  EDIT_TIMER_SYNC_DATABASE,
  EDIT_TIMER_WORKSPACE_SELECT,
  EDIT_TIMER_WORKSPACE_SELECT_PLUS,
} from "@/lib/GAEvent";
import { cn } from "@/lib/utils";

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
    { id: string; title: string; url: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notionInfoIdState, setNotionInfoIdState] = useState<string>("");
  const [databaseIdState, setDatabaseIdState] = useState<string>(""); //  이거도 받아온 걸로 바꿔줘야함.
  const [databaseUrlState, setDatabaseUrlState] = useState<string>("");

  const databaseIsLoadingRef = useRef(false);
  const [databaseIsLoadingState, setDatabaseIsLoadingState] = useState(false);
  const notionInfoIdRef = useRef("");
  const syncButtonIsLoadingRef = useRef(false);

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
      router.push("/please-login");
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
    setIsLoading(true);
    reRender();

    const result = await upsertNotionDatabaseInfo(
      data.timerId,
      data.notionInfoId,
      data.databaseId,
      data.databaseName
    );

    if (JSON.parse(result).success) {
      toast.success("Connected Databas Changed!");
      router.refresh();
    }

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
      console.log("Err : ", err);
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
                            setNotionInfoIdState(event);
                            sendGAEvent(
                              "event",
                              EDIT_TIMER_WORKSPACE_SELECT.event,
                              { value: EDIT_TIMER_WORKSPACE_SELECT.value }
                            );
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
                        <Button
                          variant={"ghost"}
                          onClick={() => {
                            handleLinkClick();
                            sendGAEvent(
                              "event",
                              EDIT_TIMER_WORKSPACE_SELECT_PLUS.event,
                              { value: EDIT_TIMER_WORKSPACE_SELECT_PLUS.value }
                            );
                          }}
                        >
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
                              setDatabaseIdState(event);

                              setDatabaseUrlState(databaseUrl);
                              sendGAEvent(
                                "event",
                                EDIT_TIMER_DATABASE_SELECT.event,
                                { value: EDIT_TIMER_DATABASE_SELECT.value }
                              );
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
                              sendGAEvent(
                                "event",
                                EDIT_TIMER_DATABASE_REFRESH.event,
                                { value: EDIT_TIMER_DATABASE_REFRESH.value }
                              );
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
                          Connect your databases with PomoLog: open a database
                          in Notion, click the &apos;...&apos; button in the
                          top-right corner → Connections → Add connections →
                          PomoLog.
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

                {databaseIdState && databaseUrlState && notionInfoIdState ? (
                  <div>
                    <p>
                      ⚠️ The database must include a Name property of type
                      &apos;title&apos; and a Date property of type
                      &apos;date&apos;
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          handleSyncDatabase();
                          sendGAEvent("event", EDIT_TIMER_SYNC_DATABASE.event, {
                            value: EDIT_TIMER_SYNC_DATABASE.value,
                          });
                        }}
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
                        className={cn(buttonVariants({ variant: "outline" }))}
                        onClick={() => {
                          sendGAEvent(
                            "event",
                            EDIT_TIMER_CHECK_DATABASE.event,
                            {
                              value: EDIT_TIMER_CHECK_DATABASE.value,
                            }
                          );
                        }}
                      >
                        Check Database
                      </Link>
                    </div>
                  </div>
                ) : (
                  <></>
                )}

                <Button
                  type="submit"
                  onClick={() => {
                    sendGAEvent("event", EDIT_TIMER_DATABASE_UPDATE_BTN.event, {
                      value: EDIT_TIMER_DATABASE_UPDATE_BTN.value,
                    });
                  }}
                >
                  Update
                </Button>
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

export default DatabaseInfo;
