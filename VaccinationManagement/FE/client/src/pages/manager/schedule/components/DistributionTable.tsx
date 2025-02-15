import { Header, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "semantic-ui-react"
import message from '@/helpers/constants/message.json';
import { Distribution } from "@/types/distribution";
import { useEffect, useState } from "react";

const paddingStyle = { padding: "0.5rem" }
const headerStyle = { ...paddingStyle, color: "white", borderRadius: 0 }
const tableRowStye = { ...paddingStyle, border: 0 }

// Return an element when table is empty
const listOrDefault = (elementList: JSX.Element[]) => {
  if (elementList.length < 1) return (
    <TableRow>
      <TableCell colSpan={5}>
        <Header textAlign='center' as={'h2'}>{message["MSG 8"]}</Header>
      </TableCell>
    </TableRow>
  )
  return elementList
}


const DistributionTable = (props: {
  list: Distribution[],
  selectedId?: string,
  onSelectDistribution?: (selectedId: string | undefined) => void
}) => {
  const [list, setList] = useState<Distribution[]>([])
  useEffect(() => {
    setList(props.list)
    handleSelect(undefined)
  }, [props.list])

  const [selectedId, setSelectedId] = useState<string>()
  useEffect(() => {
    if (props.selectedId) setSelectedId(props.selectedId)
  }, [props.selectedId])

  const handleSelect = (id: string | undefined) => {
    // console.log(id)
    setSelectedId(id)
    if (props.onSelectDistribution) props.onSelectDistribution(id)
  }

  // console.log(list)

  return (
    <Table singleLined basic={"very"} style={{ borderRadius: 0 }} selectable>
      <TableHeader style={{ backgroundColor: "#43a047" }}>
        <TableRow style={{ color: "white" }}>
          <TableHeaderCell style={headerStyle}>Vaccine</TableHeaderCell>
          <TableHeaderCell style={headerStyle}>Place</TableHeaderCell>
          <TableHeaderCell style={headerStyle}>Quantity</TableHeaderCell>
        </TableRow>
      </TableHeader>

      <TableBody>
        {
          listOrDefault(list.map(
            (distribution) =>
              <TableRow active={distribution.id == selectedId} onClick={() => handleSelect(distribution.id)}>
                <TableCell style={tableRowStye}>{distribution.vaccine?.vaccine_Name}</TableCell>
                <TableCell style={tableRowStye}>{distribution.place?.name}</TableCell>
                <TableCell style={tableRowStye}>{(distribution.quantity_Imported ?? 0) - distribution.quantity_Injected}</TableCell>
              </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}

export default DistributionTable
