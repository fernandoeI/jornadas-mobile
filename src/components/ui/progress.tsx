import { cn } from "@/src/components/ui/lib/utils";
import * as ProgressPrimitive from "@rn-primitives/progress";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";

function Progress({
  className,
  value,
  indicatorClassName,
  gradientColors,
  ...props
}: ProgressPrimitive.RootProps &
  React.RefAttributes<ProgressPrimitive.RootRef> & {
    indicatorClassName?: string;
    gradientColors?: string[];
  }) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <Indicator
        value={value}
        className={indicatorClassName}
        gradientColors={gradientColors}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

const Indicator = Platform.select({
  web: WebIndicator,
  native: NativeIndicator,
  default: NullIndicator,
});

type IndicatorProps = {
  value: number | undefined | null;
  className?: string;
  gradientColors?: string[];
};

function WebIndicator({ value, className, gradientColors }: IndicatorProps) {
  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View
      className={cn(
        "bg-primary h-full w-full flex-1 transition-all",
        className
      )}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    >
      <ProgressPrimitive.Indicator className={cn("h-full w-full", className)} />
    </View>
  );
}

function NativeIndicator({ value, className, gradientColors }: IndicatorProps) {
  const progress = useDerivedValue(() => value ?? 0);

  const indicator = useAnimatedStyle(() => {
    return {
      width: withSpring(
        `${interpolate(progress.value, [0, 100], [1, 100], Extrapolation.CLAMP)}%`,
        { overshootClamping: true }
      ),
    };
  }, [value]);

  if (Platform.OS === "web") {
    return null;
  }

  // Si se proporcionan colores de gradient, usar LinearGradient
  if (gradientColors && gradientColors.length > 0) {
    const colors =
      gradientColors.length === 1
        ? [gradientColors[0], gradientColors[0]]
        : gradientColors;

    return (
      <ProgressPrimitive.Indicator asChild>
        <Animated.View style={[indicator, { overflow: "hidden" }]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: "100%", height: "100%" }}
          />
        </Animated.View>
      </ProgressPrimitive.Indicator>
    );
  }

  return (
    <ProgressPrimitive.Indicator asChild>
      <Animated.View
        style={indicator}
        className={cn("bg-foreground h-full", className)}
      />
    </ProgressPrimitive.Indicator>
  );
}

function NullIndicator(_props: IndicatorProps) {
  return null;
}
