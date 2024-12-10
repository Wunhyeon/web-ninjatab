"use client";
import React, { useCallback, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

const ThemeEditCard = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isLoadingRef = useRef(false);

  function useReRenderer() {
    const [, setState] = useState({});
    return useCallback(() => setState({}), []);
  }
  const reRender = useReRenderer();
  return (
    <div className="relative">
      <Card
        className={`relative ${
          isLoading ? "filter blur-sm pointer-events-none" : ""
        }`}
      >
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            We are in preparation and continuously updating. Thank you 🤗
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
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

export default ThemeEditCard;
