"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

export type DataTableRowActionOption = {
  label: string;
  onClick: () => void;
};

type TableRowActionsProps = {
  primaryButtonLabel: string;
  onPrimaryAction: () => void;
  dropdownOptions?: DataTableRowActionOption[];
};

export function TableRowActions({
  primaryButtonLabel,
  onPrimaryAction,
  dropdownOptions = [],
}: TableRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const optionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const hasDropdown = dropdownOptions.length > 0;

  useEffect(() => {
    function updateDropdownPosition() {
      if (!optionsButtonRef.current) {
        return;
      }

      const rect = optionsButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right,
      });
    }

    if (isOpen) {
      updateDropdownPosition();
    }

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isInsideContainer =
        containerRef.current && containerRef.current.contains(target);
      const isInsideDropdown =
        dropdownRef.current && dropdownRef.current.contains(target);

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative inline-flex items-center gap-1">
      <button
        type="button"
        onClick={onPrimaryAction}
        className="rounded-md border border-[1px] border-slate-300 px-3 py-1 text-sm text-slate-700"
      >
        {primaryButtonLabel}
      </button>

      {hasDropdown ? (
        <>
          <button
            ref={optionsButtonRef}
            type="button"
            onClick={() => setIsOpen((currentValue) => !currentValue)}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label="Abrir mas acciones"
            className="inline-flex items-center justify-center rounded-md border border-[1px] border-slate-300 bg-[var(--panel)] px-1 py-1 text-slate-700 transition-colors hover:bg-[var(--panel-muted)]"
          >
            <span
              aria-hidden="true"
              className="h-5 w-5 bg-current"
              style={{
                WebkitMaskImage: "url(/icons/options.svg)",
                maskImage: "url(/icons/options.svg)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
          </button>

          {typeof window !== "undefined"
            ? createPortal(
                <div
                  ref={dropdownRef}
                  role="menu"
                  className={`fixed z-[70] min-w-[10rem] origin-top-right rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1 shadow-[var(--shadow)] transition-all duration-150 ${
                    isOpen
                      ? "visible translate-y-0 scale-100 opacity-100"
                      : "invisible -translate-y-1 scale-95 opacity-0"
                  }`}
                  style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    transform: "translateX(-100%)",
                  }}
                >
                  {dropdownOptions.map((option, optionIndex) => (
                    <button
                      key={`${option.label}-${optionIndex}`}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        option.onClick();
                        setIsOpen(false);
                      }}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-[var(--panel-muted)]"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>,
                document.body,
              )
            : null}
        </>
      ) : null}
    </div>
  );
}
