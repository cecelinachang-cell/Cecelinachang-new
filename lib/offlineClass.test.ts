import { describe, expect, it } from "vitest";
import { offlineScheduleLabel } from "./offlineClass";

const schedule = { label: "Sabtu, 26 Sept 2026 · mulai 10.00", startsAt: "2026-09-26T10:00:00+07:00" };

describe("offlineScheduleLabel", () => {
  it("shows the date until the class starts", () => {
    expect(offlineScheduleLabel(schedule, new Date("2026-09-23T12:00:00+07:00"))).toBe(schedule.label);
    expect(offlineScheduleLabel(schedule, new Date("2026-09-26T09:59:00+07:00"))).toBe(schedule.label);
  });

  it("switches to 'ask for the next date' once the class has started", () => {
    expect(offlineScheduleLabel(schedule, new Date("2026-09-26T10:00:00+07:00"))).toBe(
      "Jadwal kelas berikutnya: tanya Cece di WhatsApp",
    );
  });

  it("handles a class with no fixed date", () => {
    expect(offlineScheduleLabel(undefined, new Date())).toBe("Jadwal kelas berikutnya: tanya Cece di WhatsApp");
  });
});
