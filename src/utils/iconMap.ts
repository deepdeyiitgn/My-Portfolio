import React from 'react';
import {
  History, Zap, GraduationCap, Target, Milestone, UserCheck, ShieldCheck,
  Star, Trophy, Rocket, Code2, Brain, BookOpen, Lightbulb, Award, Flag,
  Calendar, Clock, MapPin, Globe, Database, Server, Cpu, Terminal,
  GitBranch, Package, Wrench, Laptop, Scroll, type LucideIcon,
} from 'lucide-react';

/** All selectable Lucide icons for timeline entries */
export const ICON_MAP: Record<string, LucideIcon> = {
  History,
  Zap,
  GraduationCap,
  Target,
  Milestone,
  UserCheck,
  ShieldCheck,
  Star,
  Trophy,
  Rocket,
  Code2,
  Brain,
  BookOpen,
  Lightbulb,
  Award,
  Flag,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Database,
  Server,
  Cpu,
  Terminal,
  GitBranch,
  Package,
  Wrench,
  Laptop,
  Scroll,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

/** Render a Lucide icon by name at the given pixel size, falling back to Milestone */
export function renderIcon(iconName: string, size = 20): React.ReactNode {
  const Icon = ICON_MAP[iconName] ?? Milestone;
  return React.createElement(Icon, { size });
}
