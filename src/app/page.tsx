import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";
import { Button } from "~/components/Button.tsx";
import { DataTable } from "~/components/DataTable/index.tsx";
import { Input } from "~/components/Input.tsx";

export default function HomePage(): React.ReactNode {
  const id = React.useId();

  return (
    <main>
      <section className="my-16">
        <h1 className="text-h2 mb-4 wrap-normal">Episodenverzeichnis</h1>
        <p className="text-large text-theme-text-subtle">
          Willkommen im ???-Archiv. Hier findest du alle Folgen der drei
          Detektive auf einen Blick – übersichtlich, durchsuchbar und sortiert.
          <span className="not-sm:hidden">
            {" "}
            Egal ob du alte Klassiker wiederentdecken oder aktuelle Fälle
            nachholen willst, hier wirst du fündig.
          </span>
        </p>
      </section>

      <DataTable
        id={id}
        className="grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_auto_1fr_auto]"
      >
        <DataTable.Controls id={id}>
          <Input
            className="h-stretch w-full max-w-none sm:w-lg"
            placeholder="Suche nach Episode..."
            autoComplete="off"
          />
        </DataTable.Controls>

        <DataTable.Header>
          <DataTable.Item>Nummer</DataTable.Item>
          <DataTable.Item>Die Drei ???</DataTable.Item>
          <DataTable.Item className="not-sm:hidden">
            Beschreibung
          </DataTable.Item>
        </DataTable.Header>

        <DataTable.Row>
          <DataTable.Item>001</DataTable.Item>

          <DataTable.Item isTitle={true}>und der Super Papagei</DataTable.Item>

          <DataTable.Item className="not-sm:hidden">
            Der Auftrag an die drei Detektive hört sich recht harmlos an: Sie
            sollen einen entflogenen Papagei suchen. Doch kaum beginnen sie mit
            ihren Nachforschungen, da scheinen sich plötzlich noch einige andere
            Leute sehr für diesen Papagei zu interessieren. Vielleicht deshalb,
            weil er lateinische Sprüche zitieren kann? Aber bald geht es nicht
            mehr nur um einen, sondern um sieben Papageien – und alle sieben
            führen höchst seltsame Reden. Ob da nicht eine geheime Botschaft
            dahintersteckt? Jedenfalls sind auch ein jähzorniger Kunsthändler
            und ein berüchtigter Meisterdieb hinter den Vögeln her. Die drei ???
            müssen sich ganz schön die hellen Köpfe zerbrechen, ehe sie diesen
            abenteuerlichen Fall aufklären und eine wohlverdiente Belohnung
            einheimsen
          </DataTable.Item>

          <DataTable.Item className="overflow-visible">
            <Button
              mode="outlined"
              asChild={true}
              suffixIcon={<ArrowRightIcon />}
            >
              <Link href="#" className="not-sm:gap-0">
                <span className="not-sm:hidden">Zur Folge</span>
              </Link>
            </Button>
          </DataTable.Item>
        </DataTable.Row>
      </DataTable>
    </main>
  );
}
