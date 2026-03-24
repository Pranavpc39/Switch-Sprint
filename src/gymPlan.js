function ytSearch(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export const gymPlan = [
  {
    dayKey: "monday",
    label: "Monday",
    title: "Back + Biceps",
    duration: "30 to 45 min",
    note: "Main pull day. Keep rest short and avoid any movement that irritates the knee.",
    exercises: [
      { name: "Lat pulldown", sets: "3 x 8-12", link: ytSearch("lat pulldown proper form tutorial") },
      { name: "Seated cable row", sets: "3 x 8-12", link: ytSearch("seated cable row proper form tutorial") },
      { name: "Chest-supported row or machine row", sets: "2 x 10-12", link: ytSearch("chest supported row tutorial") },
      { name: "Face pulls", sets: "2 x 12-15", link: ytSearch("face pull proper form tutorial") },
      { name: "Dumbbell curls", sets: "3 x 10-12", link: ytSearch("dumbbell bicep curl tutorial") },
      { name: "Hammer curls", sets: "2 x 10-12", link: ytSearch("hammer curl tutorial") },
      { name: "Arm bike finisher", sets: "8 min", link: ytSearch("arm bike cardio tutorial gym") }
    ]
  },
  {
    dayKey: "tuesday",
    label: "Tuesday",
    title: "Chest + Triceps",
    duration: "30 to 45 min",
    note: "This is the right place to start today because Monday was already completed.",
    exercises: [
      { name: "Incline dumbbell press", sets: "3 x 8-12", link: ytSearch("incline dumbbell press proper form tutorial") },
      { name: "Flat machine chest press", sets: "3 x 8-12", link: ytSearch("machine chest press tutorial") },
      { name: "Cable fly or pec deck", sets: "2 x 12-15", link: ytSearch("cable chest fly tutorial") },
      { name: "Rope pushdown", sets: "3 x 10-15", link: ytSearch("rope tricep pushdown tutorial") },
      { name: "Overhead cable tricep extension", sets: "2 x 10-15", link: ytSearch("overhead cable tricep extension tutorial") },
      { name: "Battle ropes or arm bike finisher", sets: "8 min", link: ytSearch("battle ropes cardio tutorial") }
    ]
  },
  {
    dayKey: "wednesday",
    label: "Wednesday",
    title: "Shoulders + Core",
    duration: "30 to 45 min",
    note: "Keep it controlled. Core work should be knee-safe and not involve twisting through pain.",
    exercises: [
      { name: "Seated dumbbell shoulder press", sets: "3 x 8-12", link: ytSearch("seated dumbbell shoulder press tutorial") },
      { name: "Lateral raises", sets: "3 x 12-15", link: ytSearch("dumbbell lateral raise tutorial") },
      { name: "Reverse pec deck or rear delt fly", sets: "3 x 12-15", link: ytSearch("reverse pec deck rear delt tutorial") },
      { name: "Cable front raise optional", sets: "2 x 12", link: ytSearch("cable front raise tutorial") },
      { name: "Dead bug", sets: "3 sets", link: ytSearch("dead bug exercise tutorial") },
      { name: "Forearm plank", sets: "3 rounds", link: ytSearch("forearm plank proper form tutorial") },
      { name: "Seated boxing finisher", sets: "8 min", link: ytSearch("seated boxing cardio workout") }
    ]
  },
  {
    dayKey: "thursday",
    label: "Thursday",
    title: "Chest + Back",
    duration: "30 to 45 min",
    note: "Balanced upper-body day. Great for calorie burn without loading the knee.",
    exercises: [
      { name: "Flat dumbbell press", sets: "3 x 8-12", link: ytSearch("flat dumbbell press tutorial") },
      { name: "Incline machine press", sets: "2 x 10-12", link: ytSearch("incline machine chest press tutorial") },
      { name: "Wide-grip lat pulldown", sets: "3 x 8-12", link: ytSearch("wide grip lat pulldown tutorial") },
      { name: "Seated row", sets: "2 x 10-12", link: ytSearch("seated cable row proper form tutorial") },
      { name: "Cable fly", sets: "2 x 12-15", link: ytSearch("cable fly tutorial chest") },
      { name: "Straight-arm pulldown", sets: "2 x 12-15", link: ytSearch("straight arm pulldown tutorial") },
      { name: "Battle ropes finisher", sets: "8 min", link: ytSearch("battle ropes tutorial workout") }
    ]
  },
  {
    dayKey: "friday",
    label: "Friday",
    title: "Arms + Upper Body Pump",
    duration: "30 to 45 min",
    note: "Short, efficient finish to the week. Keep it smooth and do not chase ego weight.",
    exercises: [
      { name: "EZ bar curl or cable curl", sets: "3 x 10-12", link: ytSearch("EZ bar curl tutorial") },
      { name: "Rope pushdown", sets: "3 x 10-15", link: ytSearch("rope tricep pushdown tutorial") },
      { name: "Incline dumbbell curl", sets: "2 x 10-12", link: ytSearch("incline dumbbell curl tutorial") },
      { name: "Overhead tricep extension", sets: "2 x 10-12", link: ytSearch("overhead tricep extension tutorial") },
      { name: "Lateral raises", sets: "2 x 15", link: ytSearch("dumbbell lateral raise tutorial") },
      { name: "Face pulls", sets: "2 x 15", link: ytSearch("face pull proper form tutorial") },
      { name: "Push-ups or assisted push-ups", sets: "2 sets", link: ytSearch("push up proper form tutorial") },
      { name: "Arm bike finisher", sets: "8 to 10 min", link: ytSearch("arm bike cardio tutorial gym") }
    ]
  },
  {
    dayKey: "saturday",
    label: "Saturday",
    title: "Optional Recovery",
    duration: "20 to 30 min",
    note: "If you miss weekends, that is fine. This day is optional movement only.",
    exercises: [
      { name: "Easy walk if knee feels okay", sets: "20 to 30 min", link: ytSearch("easy treadmill walking form") },
      { name: "Doctor or PT prescribed knee rehab", sets: "As prescribed", link: ytSearch("acl rehab exercises physiotherapy") },
      { name: "Upper-body mobility", sets: "10 min", link: ytSearch("upper body mobility routine tutorial") }
    ]
  },
  {
    dayKey: "sunday",
    label: "Sunday",
    title: "Rest",
    duration: "Recovery day",
    note: "Full rest is fine. Focus on food, sleep, and letting the knee calm down.",
    exercises: [
      { name: "Light stretching if needed", sets: "10 min", link: ytSearch("light stretching routine tutorial") },
      { name: "Gentle walk if comfortable", sets: "Optional", link: ytSearch("easy walking for recovery") }
    ]
  }
];

export const weekdayIndexToKey = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday"
};
