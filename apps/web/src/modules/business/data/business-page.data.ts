import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import { FIGURE_LAB_TEAM_GIFT_IMAGE } from "@/config/marketing-media";

export const BUSINESS_HERO_IMAGES = [
  "/home/graduation-celebration.png",
  "/home/love-frame.png",
  FIGURE_LAB_TEAM_GIFT_IMAGE,
  "/home/birthday-frame.png",
] as const;

export const BUSINESS_SHOWCASE_IMAGES = [
  FIGURE_LAB_TEAM_GIFT_IMAGE,
  "/home/love-frame.png",
  "/home/graduation-celebration.png",
  "/home/birthday-frame.png",
] as const;

export const BUSINESS_METRIC_ICONS = [
  DECORATIVE_ICON_PATHS.telephoneReceiver,
  DECORATIVE_ICON_PATHS.chartIncreasing,
  DECORATIVE_ICON_PATHS.receipt,
  DECORATIVE_ICON_PATHS.deliveryTruck,
] as const;

export const BUSINESS_USE_CASE_ICONS = [
  DECORATIVE_ICON_PATHS.trophy,
  DECORATIVE_ICON_PATHS.identificationCard,
  DECORATIVE_ICON_PATHS.handshake,
  DECORATIVE_ICON_PATHS.calendar,
  DECORATIVE_ICON_PATHS.officeBuilding,
  DECORATIVE_ICON_PATHS.megaphone,
] as const;

export const BUSINESS_BENEFIT_ICONS = [
  DECORATIVE_ICON_PATHS.chartIncreasing,
  DECORATIVE_ICON_PATHS.artistPalette,
  DECORATIVE_ICON_PATHS.receipt,
  DECORATIVE_ICON_PATHS.deliveryTruck,
] as const;

export const BUSINESS_PROCESS_ICONS = [
  DECORATIVE_ICON_PATHS.envelope,
  DECORATIVE_ICON_PATHS.telephoneReceiver,
  DECORATIVE_ICON_PATHS.checkMark,
  DECORATIVE_ICON_PATHS.package,
] as const;
