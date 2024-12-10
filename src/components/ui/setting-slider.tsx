"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SettingSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  lineColor?: string;
  thumbColor?: string;
}

const SettingSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SettingSliderProps
>(({ className, lineColor, thumbColor, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center h-12 border-2  rounded-xl",
      className,
      lineColor
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-purple-500 ">
      <SliderPrimitive.Range className="absolute h-full bg-blue-500" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn("block h-9 w-9 rounded-full  cursor-pointer", thumbColor)}
    />
  </SliderPrimitive.Root>
));
SettingSlider.displayName = SliderPrimitive.Root.displayName;

export { SettingSlider };
