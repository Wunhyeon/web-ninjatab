"use client";

import Image from "next/image";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
const dummy: {
  id: string;
  name: string;
  notion_info: {
    id: string;
    database_name: string | null;
  }[];
}[] = [
  { id: "111", name: "111", notion_info: [] },
  {
    id: "222",
    name: "222",
    notion_info: [{ id: "notioninfo2", database_name: "dbname2" }],
  },
];
export default function MyTimersList() {
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>My Timers</CardTitle>
        <CardDescription>Manage your pomodoro timers.</CardDescription>
      </CardHeader>
      <Button className="absolute top-3 right-3">Add Timer</Button>
      <CardContent>
        <Table>
          <TableBody>
            {dummy.map((el, idx) => (
              <TableRow key={el.id}>
                {/* <TableCell className="font-medium">{idx + 1}</TableCell> */}
                <TableCell className="font-medium">{el.name}</TableCell>
                <TableCell>
                  {/* <Badge variant="outline"> */}{" "}
                  {el.notion_info.length && el.notion_info[0].database_name
                    ? el.notion_info[0].database_name
                    : "Not Connected Notion Database Yet"}
                  {/* </Badge> */}
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">
                          {/* {el.notion_info[0].database_name} */}
                          Active
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        {/* <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div> */}
      </CardFooter>
    </Card>
  );
}
