import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Button } from "~/components/Button.tsx";
import { DataTable } from "~/components/DataTable.tsx";

export default function HomePage(): React.ReactNode {
  return (
    <DataTable className="grid-cols-[auto_auto_1fr_auto]">
      <DataTable.Header>
        <DataTable.Item>Nummer</DataTable.Item>
        <DataTable.Item>Die Drei ???</DataTable.Item>
        <DataTable.Item>Beschreibung</DataTable.Item>
      </DataTable.Header>

      <DataTable.Row>
        <DataTable.Item>001</DataTable.Item>

        <DataTable.Item isTitle={true}>und der Super Papagei</DataTable.Item>

        <DataTable.Item>
          Der Auftrag an die drei Detektive hört sich recht harmlos an: Sie
          sollen einen entflogenen Papagei suchen. Doch kaum beginnen sie mit
          ihren Nachforschungen, da scheinen sich plötzlich noch einige andere
          Leute sehr für diesen Papagei zu interessieren. Vielleicht deshalb,
          weil er lateinische Sprüche zitieren kann? Aber bald geht es nicht
          mehr nur um einen, sondern um sieben Papageien – und alle sieben
          führen höchst seltsame Reden. Ob da nicht eine geheime Botschaft
          dahintersteckt? Jedenfalls sind auch ein jähzorniger Kunsthändler und
          ein berüchtigter Meisterdieb hinter den Vögeln her. Die drei ???
          müssen sich ganz schön die hellen Köpfe zerbrechen, ehe sie diesen
          abenteuerlichen Fall aufklären und eine wohlverdiente Belohnung
          einheimsen
        </DataTable.Item>

        <DataTable.Item>
          <Button
            mode="outlined"
            asChild={true}
            suffixIcon={<ArrowRightIcon />}
          >
            <Link href="#">Zur Folge</Link>
          </Button>
        </DataTable.Item>
      </DataTable.Row>
    </DataTable>
  );
}
