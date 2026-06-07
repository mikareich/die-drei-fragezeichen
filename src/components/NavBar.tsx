"use client";

import { Cross2Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";
import { Button } from "./Button.tsx";
import { Logo } from "./Logo.tsx";

const LINKS = [
  { title: "Episoden", href: "/episodes" },
  { title: "Personen", href: "/people" },
  { title: "Account", href: "/account" },
] as const;

function Drawer(): React.ReactNode {
  return (
    <aside className="w-screen mt-0.75 sm:hidden flex flex-col items-end border-b border-theme-border gap-4 p-4 bg-theme-background fixed anchored/navbar anchored-bottom-span-left">
      {LINKS.map(({ title, href }) => (
        <Link key={href} href={href} className="h-fit truncate text-link">
          {title}
        </Link>
      ))}
    </aside>
  );
}

export function NavBar(): React.ReactNode {
  const [showDrawer, toggleDrawer] = React.useReducer(
    (showDrawer) => !showDrawer,
    false,
  );

  let drawerIcon = <HamburgerMenuIcon />;

  if (showDrawer) {
    drawerIcon = <Cross2Icon />;
  }

  return (
    <>
      <nav className="my-16 flex z-10 h-12 w-full items-center gap-4 anchor/navbar">
        <Link href="/" className="focus:outlined">
          <Logo className="shrink-0" />
        </Link>

        <span className="flex-1" />

        {LINKS.map(({ title, href }) => (
          <Link
            key={href}
            href={href}
            className="not-sm:hidden h-fit truncate text-link"
          >
            {title}
          </Link>
        ))}

        <Button
          className="sm:hidden"
          onClick={toggleDrawer}
          mode="outlined"
          prefixIcon={drawerIcon}
        />
      </nav>

      {showDrawer && <Drawer />}
    </>
  );
}
