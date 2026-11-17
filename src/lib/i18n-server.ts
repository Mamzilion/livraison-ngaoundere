import "server-only";
import { cookies } from "next/headers";
import { LANG_COOKIE, isLang, translate, type Lang, type TFn } from "./i18n";

export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : "fr";
}

export async function getT(): Promise<TFn> {
  const lang = await getLang();
  return (key, vars) => translate(lang, key, vars);
}
