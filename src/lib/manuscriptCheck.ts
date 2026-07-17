const RECOMMENDED_MIN = 400;
const RECOMMENDED_MAX = 1500;

const REQUIRED_SECTIONS = ["仕事内容", "給与", "応募資格", "魅力"];

export type StructureCheck = {
  charCount: number;
  lengthStatus: "too_short" | "ok" | "too_long";
  missingSections: string[];
};

export function checkManuscript(content: string): StructureCheck {
  const charCount = content.length;

  let lengthStatus: StructureCheck["lengthStatus"] = "ok";
  if (charCount < RECOMMENDED_MIN) lengthStatus = "too_short";
  else if (charCount > RECOMMENDED_MAX) lengthStatus = "too_long";

  const missingSections = REQUIRED_SECTIONS.filter(
    (section) => !content.includes(section)
  );

  return { charCount, lengthStatus, missingSections };
}

export const RECOMMENDED_RANGE = { min: RECOMMENDED_MIN, max: RECOMMENDED_MAX };
