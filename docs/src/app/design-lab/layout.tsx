import { LabSwitcher } from "@/components/design-lab/design-lab";

export default function DesignLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`body { overflow: hidden; } [data-site-navbar] { display: none; }`}</style>
      <div
        className="fixed inset-0 z-[100] overflow-x-hidden overflow-y-auto bg-white text-black"
        data-design-lab
      >
        <LabSwitcher />
        <div className="min-h-[calc(100dvh-48px)]">{children}</div>
      </div>
    </>
  );
}
