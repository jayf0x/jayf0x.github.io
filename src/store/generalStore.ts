import { WidgetName } from "@/config";
import { atom } from "jotai";

export const isMobileAtom = atom<boolean>(false);

export const currentWidgetAtom = atom<WidgetName | null>(null);
