import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StudentProof } from "./StudentProof";

describe("StudentProof", () => {
  it("sizes each screenshot by its own dimensions, so square and tall ones reserve the right space", () => {
    const html = renderToStaticMarkup(
      <StudentProof
        testimonials={[
          { src: "/a.jpg", alt: "tall", width: 489, height: 800 },
          { src: "/b.jpg", alt: "square", width: 700, height: 701 },
        ]}
      />,
    );
    expect(html).toMatch(/alt="tall"[^>]*width="489"[^>]*height="800"|width="489"[^>]*height="800"[^>]*alt="tall"/s);
    expect(html).toMatch(/width="700"[^>]*height="701"/);
  });

  it("renders nothing without testimonials", () => {
    expect(renderToStaticMarkup(<StudentProof testimonials={[]} />)).toBe("");
  });
});
