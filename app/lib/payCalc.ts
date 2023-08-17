import { User } from "@prisma/client";
import { PAY_PER_ANNOTATION, ERROR_VALUE } from "~/constant";

export function error_and_pay(user: User) {
  const totalErrorCount = user?.approved_text.reduce(
    (acc, obj) => acc + parseInt(obj.error_count),
    0
  );
  let errorcount = totalErrorCount / user?.approved_text?.length;
  const finalErrorCount = isNaN(errorcount) ? 0 : errorcount;
  const pay =
    user.approved_text.length * PAY_PER_ANNOTATION -
    finalErrorCount * ERROR_VALUE;
  return { finalErrorCount: finalErrorCount.toFixed(2), pay: pay.toFixed(2) };
}
