const AccordionDemo = () => import("@/examples/ui/accordion");
const AlertDemo = () => import("@/examples/ui/alert");
const AlertDialogDemo = () => import("@/examples/ui/alert-dialog");
const AlertDescriptionOnlyDemo = () => import("@/examples/ui/alert/description-only");
const AlertDestructiveDemo = () => import("@/examples/ui/alert/destructive");
const AlertIconDescriptionDemo = () => import("@/examples/ui/alert/icon-description");
const AlertIconTitleDemo = () => import("@/examples/ui/alert/icon-title");
const AlertLongDescriptionDemo = () => import("@/examples/ui/alert/long-description");
const AlertLongTitleDemo = () => import("@/examples/ui/alert/long-title");
const AlertLongTitleAndDescriptionDemo = () =>
  import("@/examples/ui/alert/long-title-and-description");
const AlertWithButtonDemo = () => import("@/examples/ui/alert/with-button");
const AvatarDemo = () => import("@/examples/ui/avatar");
const AvatarFallbackDemo = () => import("@/examples/ui/avatar/fallback");
const BadgeDemo = () => import("@/examples/ui/badge");
const BadgeNeutralDemo = () => import("@/examples/ui/badge/neutral");
const BadgeWithIconDemo = () => import("@/examples/ui/badge/with-icon");
const BreadcrumbDemo = () => import("@/examples/ui/breadcrumb");
const ButtonDemo = () => import("@/examples/ui/button");
const ButtonIconDemo = () => import("@/examples/ui/button/icon");
const ButtonNeutralDemo = () => import("@/examples/ui/button/neutral");
const ButtonNoShadowDemo = () => import("@/examples/ui/button/no-shadow");
const ButtonReverseDemo = () => import("@/examples/ui/button/reverse");
const ButtonWithIconDemo = () => import("@/examples/ui/button/with-icon");
const CalendarDemo = () => import("@/examples/ui/calendar/index");
const CalendarRangeDemo = () => import("@/examples/ui/calendar/range");
const CardDemo = () => import("@/examples/ui/card");
const CarouselDemo = () => import("@/examples/ui/carousel");
const ChartDemo = () => import("@/examples/ui/chart/chart-area-stacked");
const CheckboxDemo = () => import("@/examples/ui/checkbox");
const CollapsibleDemo = () => import("@/examples/ui/collapsible");
const ComboboxDemo = () => import("@/examples/ui/combobox");
const ComboboxMultiselectDemo = () => import("@/examples/ui/combobox/multiselect");
const ComboboxTimezonesDemo = () => import("@/examples/ui/combobox/timezones");
const ComboboxUsersDemo = () => import("@/examples/ui/combobox/users");
const CommandDemo = () => import("@/examples/ui/command");
const ContextMenuDemo = () => import("@/examples/ui/context-menu");
const DataTableDemo = () => import("@/examples/ui/data-table");
const DatePickerDemo = () => import("@/examples/ui/date-picker");
const DialogDemo = () => import("@/examples/ui/dialog");
const DialogWithScrollableContent = () => import("@/examples/ui/dialog/scrollable-content");
const DialogWithStickyFooter = () => import("@/examples/ui/dialog/sticky-footer");
const DrawerDemo = () => import("@/examples/ui/drawer");
const DrawerWithScrollableContent = () => import("@/examples/ui/drawer/scrollable-content");
const DropdownMenuDemo = () => import("@/examples/ui/dropdown-menu");
const DropdownMenuCheckboxes = () => import("@/examples/ui/dropdown-menu/checkboxes");
const DropdownMenuRadioGroupDemo = () => import("@/examples/ui/dropdown-menu/radio");
const FormDemo = () => import("@/examples/ui/form");
const HoverCardDemo = () => import("@/examples/ui/hover-card");
const ImageCardDemo = () => import("@/examples/ui/image-card");
const InputDemo = () => import("@/examples/ui/input");
const InputGroupDemo = () => import("@/examples/ui/input-group");
const InputOTPDemo = () => import("@/examples/ui/input-otp");
const InputDisabledDemo = () => import("@/examples/ui/input/disabled");
const InputFileDemo = () => import("@/examples/ui/input/file");
const InputWithButtonDemo = () => import("@/examples/ui/input/with-button");
const InputWithLabelDemo = () => import("@/examples/ui/input/with-label");
const LabelDemo = () => import("@/examples/ui/label");
const MarqueeDemo = () => import("@/examples/ui/marquee");
const MenubarDemo = () => import("@/examples/ui/menubar");
const NavigationMenuDemo = () => import("@/examples/ui/navigation-menu");
const PaginationDemo = () => import("@/examples/ui/pagination");
const PopoverDemo = () => import("@/examples/ui/popover");
const ProgressDemo = () => import("@/examples/ui/progress");
const RadioGroupDemo = () => import("@/examples/ui/radio-group");
const ResizableDemo = () => import("@/examples/ui/resizable");
const ScrollAreaDemo = () => import("@/examples/ui/scroll-area");
const SelectDemo = () => import("@/examples/ui/select");
const SelectDisabledDemo = () => import("@/examples/ui/select/disabled");
const SelectLargeListDemo = () => import("@/examples/ui/select/large-list");
const SeparatorDemo = () => import("@/examples/ui/separator");
const SelectWithIconDemo = () => import("@/examples/ui/select/with-icon");
const SheetDemo = () => import("@/examples/ui/sheet");
const SheetSideDemo = () => import("@/examples/ui/sheet/side");
const SidebarDemo = () => import("@/examples/ui/sidebar/page");
const SkeletonDemo = () => import("@/examples/ui/skeleton");
const SliderDemo = () => import("@/examples/ui/slider");
const SliderControlled = () => import("@/examples/ui/slider/controlled");
const TwoThumbsSliderDemo = () => import("@/examples/ui/slider/two-thumbs");
const VerticalSliderDemo = () => import("@/examples/ui/slider/vertical");
const SonnerDemo = () => import("@/examples/ui/sonner");
const SonnerActionDemo = () => import("@/examples/ui/sonner/action");
const SonnerCancelDemo = () => import("@/examples/ui/sonner/cancel");
const SonnerErrorDemo = () => import("@/examples/ui/sonner/error");
const SonnerInfoDemo = () => import("@/examples/ui/sonner/info");
const SonnerPromiseDemo = () => import("@/examples/ui/sonner/promise");
const SonnerSuccessDemo = () => import("@/examples/ui/sonner/success");
const SonnerWarningDemo = () => import("@/examples/ui/sonner/warning");
const SwitchDemo = () => import("@/examples/ui/switch");
const TableDemo = () => import("@/examples/ui/table");
const TabsDemo = () => import("@/examples/ui/tabs");
const TextareaDemo = () => import("@/examples/ui/textarea");
const TooltipDemo = () => import("@/examples/ui/tooltip");

type PreviewLoader = () => Promise<{ default: React.ComponentType }>;

type Component = {
  name: string;
  exampleComponent?: PreviewLoader;
  examples?: Record<string, PreviewLoader>;
  notShadcn?: boolean;
};

const COMPONENTS: Component[] = [
  {
    name: "Accordion",
    exampleComponent: AccordionDemo,
  },
  {
    name: "Alert Dialog",
    exampleComponent: AlertDialogDemo,
  },
  {
    name: "Alert",
    exampleComponent: AlertDemo,
    examples: {
      default: AlertDemo,
      destructive: AlertDestructiveDemo,
      "icon-description": AlertIconDescriptionDemo,
      "description-only": AlertDescriptionOnlyDemo,
      "icon-title": AlertIconTitleDemo,
      "long-description": AlertLongDescriptionDemo,
      "long-title": AlertLongTitleDemo,
      "long-title-and-description": AlertLongTitleAndDescriptionDemo,
      "with-button": AlertWithButtonDemo,
    },
  },
  {
    name: "Avatar",
    exampleComponent: AvatarDemo,
    examples: {
      default: AvatarDemo,
      fallback: AvatarFallbackDemo,
    },
  },
  {
    name: "Badge",
    exampleComponent: BadgeDemo,
    examples: {
      default: BadgeDemo,
      neutral: BadgeNeutralDemo,
      "with-icon": BadgeWithIconDemo,
    },
  },
  {
    name: "Breadcrumb",
    exampleComponent: BreadcrumbDemo,
  },
  {
    name: "Button",
    exampleComponent: ButtonDemo,
    examples: {
      default: ButtonDemo,
      reverse: ButtonReverseDemo,
      noShadow: ButtonNoShadowDemo,
      neutral: ButtonNeutralDemo,
      "with-icon": ButtonWithIconDemo,
      icon: ButtonIconDemo,
    },
  },
  {
    name: "Calendar",
    exampleComponent: CalendarDemo,
    examples: {
      default: CalendarDemo,
      range: CalendarRangeDemo,
    },
  },
  {
    name: "Card",
    exampleComponent: CardDemo,
  },
  {
    name: "Carousel",
    exampleComponent: CarouselDemo,
  },
  {
    name: "Chart",
    exampleComponent: ChartDemo,
  },
  {
    name: "Checkbox",
    exampleComponent: CheckboxDemo,
  },
  {
    name: "Collapsible",
    exampleComponent: CollapsibleDemo,
  },
  {
    name: "Combobox",
    exampleComponent: ComboboxDemo,
    examples: {
      default: ComboboxDemo,
      users: ComboboxUsersDemo,
      timezones: ComboboxTimezonesDemo,
      multiselect: ComboboxMultiselectDemo,
    },
  },
  {
    name: "Command",
    exampleComponent: CommandDemo,
  },
  {
    name: "Context Menu",
    exampleComponent: ContextMenuDemo,
  },
  {
    name: "Date Picker",
    exampleComponent: DatePickerDemo,
  },
  {
    name: "Data Table",
    exampleComponent: DataTableDemo,
  },
  {
    name: "Dialog",
    exampleComponent: DialogDemo,
    examples: {
      default: DialogDemo,
      "scrollable-content": DialogWithScrollableContent,
      "sticky-footer": DialogWithStickyFooter,
    },
  },
  {
    name: "Drawer",
    exampleComponent: DrawerDemo,
    examples: {
      default: DrawerDemo,
      "scrollable-content": DrawerWithScrollableContent,
    },
  },
  {
    name: "Dropdown Menu",
    exampleComponent: DropdownMenuDemo,
    examples: {
      default: DropdownMenuDemo,
      checkboxes: DropdownMenuCheckboxes,
      radio: DropdownMenuRadioGroupDemo,
    },
  },
  {
    name: "Form",
    exampleComponent: FormDemo,
  },
  {
    name: "Hover Card",
    exampleComponent: HoverCardDemo,
  },
  {
    name: "Image Card",
    exampleComponent: ImageCardDemo,
    notShadcn: true,
  },
  {
    name: "Input Group",
    exampleComponent: InputGroupDemo,
  },
  {
    name: "Input Otp",
    exampleComponent: InputOTPDemo,
  },
  {
    name: "Input",
    exampleComponent: InputDemo,
    examples: {
      default: InputDemo,
      file: InputFileDemo,
      disabled: InputDisabledDemo,
      "with-label": InputWithLabelDemo,
      "with-button": InputWithButtonDemo,
    },
  },
  {
    name: "Label",
    exampleComponent: LabelDemo,
  },
  {
    name: "Marquee",
    exampleComponent: MarqueeDemo,
    notShadcn: true,
  },
  {
    name: "Menubar",
    exampleComponent: MenubarDemo,
  },
  {
    name: "Navigation Menu",
    exampleComponent: NavigationMenuDemo,
  },
  {
    name: "Pagination",
    exampleComponent: PaginationDemo,
  },
  {
    name: "Popover",
    exampleComponent: PopoverDemo,
  },
  {
    name: "Progress",
    exampleComponent: ProgressDemo,
  },
  {
    name: "Radio Group",
    exampleComponent: RadioGroupDemo,
  },
  {
    name: "Resizable",
    exampleComponent: ResizableDemo,
  },
  {
    name: "Scroll Area",
    exampleComponent: ScrollAreaDemo,
  },
  {
    name: "Select",
    exampleComponent: SelectDemo,
    examples: {
      default: SelectDemo,
      "large-list": SelectLargeListDemo,
      disabled: SelectDisabledDemo,
      "with-icon": SelectWithIconDemo,
    },
  },
  {
    name: "Separator",
    exampleComponent: SeparatorDemo,
  },
  {
    name: "Sheet",
    exampleComponent: SheetDemo,
    examples: {
      default: SheetDemo,
      side: SheetSideDemo,
    },
  },
  {
    name: "Sidebar",
    exampleComponent: SidebarDemo,
  },
  {
    name: "Skeleton",
    exampleComponent: SkeletonDemo,
  },
  {
    name: "Slider",
    exampleComponent: SliderDemo,
    examples: {
      default: SliderDemo,
      "two-thumbs": TwoThumbsSliderDemo,
      vertical: VerticalSliderDemo,
      controlled: SliderControlled,
    },
  },
  {
    name: "Sonner",
    exampleComponent: SonnerDemo,
    examples: {
      default: SonnerDemo,
      success: SonnerSuccessDemo,
      info: SonnerInfoDemo,
      warning: SonnerWarningDemo,
      error: SonnerErrorDemo,
      action: SonnerActionDemo,
      cancel: SonnerCancelDemo,
      promise: SonnerPromiseDemo,
    },
  },
  {
    name: "Switch",
    exampleComponent: SwitchDemo,
  },
  {
    name: "Table",
    exampleComponent: TableDemo,
  },
  {
    name: "Tabs",
    exampleComponent: TabsDemo,
  },
  {
    name: "Textarea",
    exampleComponent: TextareaDemo,
  },
  {
    name: "Tooltip",
    exampleComponent: TooltipDemo,
  },
];

export default COMPONENTS;
