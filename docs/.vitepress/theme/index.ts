import type { Theme } from "vitepress";

import "../../src/styling/globals.css";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "./styles/index.css";

import Layout from "./Layout.vue";
import ComponentPreview from "./components/ComponentPreview.vue";
import Installation from "./components/Installation.vue";
import MdLink from "./components/MdLink.vue";
import SpecialPage from "./components/SpecialPage.vue";
import Table from "./components/table/Table.vue";
import TableBody from "./components/table/TableBody.vue";
import TableCaption from "./components/table/TableCaption.vue";
import TableCell from "./components/table/TableCell.vue";
import TableFooter from "./components/table/TableFooter.vue";
import TableHead from "./components/table/TableHead.vue";
import TableHeader from "./components/table/TableHeader.vue";
import TableRow from "./components/table/TableRow.vue";

export default {
  Layout,
  enhanceApp({ app }) {
    app.component("ComponentPreview", ComponentPreview);
    app.component("Installation", Installation);
    app.component("Link", MdLink);
    app.component("SpecialPage", SpecialPage);
    app.component("Table", Table);
    app.component("TableBody", TableBody);
    app.component("TableCaption", TableCaption);
    app.component("TableCell", TableCell);
    app.component("TableFooter", TableFooter);
    app.component("TableHead", TableHead);
    app.component("TableHeader", TableHeader);
    app.component("TableRow", TableRow);
  },
} satisfies Theme;
