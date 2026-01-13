import { useMemo, useState } from "react";
import "./App.css";
import coursesData from "./data/courses.json";

type Course = {
  id: string;
  section: string;
  title: string;
  instructor: string;
  days: string[];
  start: string;
  end: string;
  category: string;
};

type ScheduleItem = {
  course: Course;
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
};

type ConflictBlock = {
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
};

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const dayIndexByShortName: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const dayStartMinutes = 8 * 60;
const dayEndMinutes = 22 * 60 + 30;
const slotMinutes = 30;

const timeSlots = Array.from(
  { length: (dayEndMinutes - dayStartMinutes) / slotMinutes },
  (_, index) => dayStartMinutes + index * slotMinutes
);

const courses: Course[] = coursesData.courses;

const toMinutes = (value: string) => {
  const [timePart, meridiem] = value.split(" ");
  const [hoursString, minutesString] = timePart.split(":");
  let hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

const toTimeLabel = (totalMinutes: number) => {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;

  if (hours12 === 0) {
    hours12 = 12;
  }

  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )} ${meridiem}`;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function App() {
  const [query, setQuery] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const normalizedQuery = query.trim().toLowerCase();

  const matchingCourses = useMemo(() => {
    if (!normalizedQuery) {
      return [] as Course[];
    }

    return courses.filter((course) =>
      course.id.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const selectedCourses = useMemo(
    () =>
      courses.filter((course) =>
        selectedCourseIds.includes(`${course.id}-${course.section}`)
      ),
    [selectedCourseIds]
  );

  const categories = Array.from(
    new Set(selectedCourses.map((course) => course.category))
  );

  const scheduleItems = useMemo(() => {
    const items: ScheduleItem[] = [];

    selectedCourses.forEach((course) => {
      const startMinutes = toMinutes(course.start);
      const endMinutes = toMinutes(course.end);

      course.days.forEach((day) => {
        const dayIndex = dayIndexByShortName[day];

        if (dayIndex === undefined) {
          return;
        }

        items.push({
          course,
          dayIndex,
          startMinutes,
          endMinutes,
        });
      });
    });

    return items;
  }, [selectedCourses]);

  const conflictBlocks = useMemo(() => {
    const blocks: ConflictBlock[] = [];
    const itemsByDay = Array.from({ length: dayNames.length }, () =>
      [] as ScheduleItem[]
    );

    scheduleItems.forEach((item) => {
      itemsByDay[item.dayIndex].push(item);
    });

    itemsByDay.forEach((items, dayIndex) => {
      if (items.length < 2) {
        return;
      }

      const events = items
        .flatMap((item) => [
          { time: item.startMinutes, delta: 1 },
          { time: item.endMinutes, delta: -1 },
        ])
        .sort((a, b) => a.time - b.time || a.delta - b.delta);

      let activeCount = 0;
      let conflictStart: number | null = null;

      events.forEach((event) => {
        const nextCount = activeCount + event.delta;

        if (activeCount < 2 && nextCount >= 2) {
          conflictStart = event.time;
        } else if (activeCount >= 2 && nextCount < 2 && conflictStart !== null) {
          if (event.time > conflictStart) {
            blocks.push({
              dayIndex,
              startMinutes: conflictStart,
              endMinutes: event.time,
            });
          }
          conflictStart = null;
        }

        activeCount = nextCount;
      });
    });

    return blocks;
  }, [scheduleItems]);

  const addCourse = (course: Course) => {
    const key = `${course.id}-${course.section}`;

    if (!selectedCourseIds.includes(key)) {
      setSelectedCourseIds((prev) => [...prev, key]);
    }
  };

  const removeCourse = (course: Course) => {
    const key = `${course.id}-${course.section}`;
    setSelectedCourseIds((prev) => prev.filter((id) => id !== key));
  };

  const availableMatches = matchingCourses.filter(
    (course) => !selectedCourseIds.includes(`${course.id}-${course.section}`)
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-title">Selected Courses :</div>

        {selectedCourses.length === 0 ? (
          <div className="empty-state">No courses added yet.</div>
        ) : (
          <div className="course-groups">
            {categories.map((category) => {
              const groupedCourses = selectedCourses.filter(
                (course) => course.category === category
              );

              return (
                <details className="course-group" open key={category}>
                  <summary>
                    <span>{category}</span>
                    <span className="course-count">({groupedCourses.length})</span>
                  </summary>
                  <div className="course-list">
                    {groupedCourses.map((course) => (
                      <div
                        className="course-card"
                        key={`${course.id}-${course.section}`}
                      >
                        <div className="course-card-header">
                          <div>
                            <div className="course-id">
                              {course.id} - {course.section}
                            </div>
                            <div className="course-title">{course.title}</div>
                          </div>
                          <button
                            className="remove-button"
                            type="button"
                            onClick={() => removeCourse(course)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="course-meta">{course.instructor}</div>
                        <div className="course-time">
                          {course.start} - {course.end} {course.days.join(" ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </aside>

      <main className="schedule">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Course ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path
                d="M15.5 14h-.8l-.3-.3A6.4 6.4 0 1 0 14 15.5l.3.3v.8L20 22l2-2-6.5-6zm-6.1 0A4.6 4.6 0 1 1 10 5.8 4.6 4.6 0 0 1 9.4 14z"
                fill="currentColor"
              />
            </svg>
          </span>
        </div>

        <section className="search-results">
          {!normalizedQuery ? (
            <div className="search-empty">Type a course ID to add it.</div>
          ) : availableMatches.length === 0 ? (
            <div className="search-empty">No matching courses found.</div>
          ) : (
            availableMatches.map((course) => (
              <div
                className="search-result"
                key={`${course.id}-${course.section}`}
              >
                <div>
                  <div className="result-title">
                    {course.id} - {course.section}
                  </div>
                  <div className="result-subtitle">{course.title}</div>
                  <div className="result-meta">
                    {course.start} - {course.end} {course.days.join(" ")}
                  </div>
                </div>
                <button
                  className="add-button"
                  type="button"
                  onClick={() => addCourse(course)}
                >
                  Add
                </button>
              </div>
            ))
          )}
        </section>

        <section className="calendar">
          <div className="calendar-header">
            <div className="time-spacer" />
            {dayNames.map((day) => (
              <div className="day-name" key={day}>
                {day}
              </div>
            ))}
          </div>

          <div
            className="calendar-body"
            style={{ gridTemplateRows: `repeat(${timeSlots.length}, 40px)` }}
          >
            {timeSlots.map((slotMinutesValue, rowIndex) => {
              const showLabel = slotMinutesValue % 60 === 0;
              return (
                <div
                  className="time-label"
                  key={`time-${slotMinutesValue}`}
                  style={{ gridRow: rowIndex + 1, gridColumn: 1 }}
                >
                  {showLabel ? toTimeLabel(slotMinutesValue) : ""}
                </div>
              );
            })}

            {timeSlots.map((slotMinutesValue, rowIndex) =>
              dayNames.map((day, dayIndex) => (
                <div
                  className="calendar-cell"
                  key={`${day}-${slotMinutesValue}`}
                  style={{ gridRow: rowIndex + 1, gridColumn: dayIndex + 2 }}
                />
              ))
            )}

            {conflictBlocks.map((block) => {
              const startRow = clamp(
                Math.floor((block.startMinutes - dayStartMinutes) / slotMinutes) +
                  1,
                1,
                timeSlots.length + 1
              );
              const endRow = clamp(
                Math.ceil((block.endMinutes - dayStartMinutes) / slotMinutes) + 1,
                1,
                timeSlots.length + 1
              );

              if (endRow <= startRow) {
                return null;
              }

              return (
                <div
                  className="conflict-block"
                  key={`conflict-${block.dayIndex}-${block.startMinutes}`}
                  style={{
                    gridColumn: block.dayIndex + 2,
                    gridRow: `${startRow} / ${endRow}`,
                    zIndex: 5000,
                  }}
                />
              );
            })}

            {scheduleItems.map((item) => {
              const startRow = clamp(
                Math.floor((item.startMinutes - dayStartMinutes) / slotMinutes) +
                  1,
                1,
                timeSlots.length + 1
              );
              const endRow = clamp(
                Math.ceil((item.endMinutes - dayStartMinutes) / slotMinutes) + 1,
                1,
                timeSlots.length + 1
              );

              if (endRow <= startRow) {
                return null;
              }

              return (
                <div
                  className="schedule-item"
                  key={`${item.course.id}-${item.course.section}-${item.dayIndex}`}
                  style={{
                    gridColumn: item.dayIndex + 2,
                    gridRow: `${startRow} / ${endRow}`,
                    zIndex: 2 + item.startMinutes,
                  }}
                >
                  <div className="schedule-item-title">
                    {item.course.id} - {item.course.section}
                  </div>
                  <div className="schedule-item-subtitle">
                    {item.course.title}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
