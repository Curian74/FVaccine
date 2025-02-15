import { Header, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "semantic-ui-react"
import message from '@/helpers/constants/message.json';
import { Schedule } from "@/types/schedule";
import { formatDate } from "../utils/scheduleUtils";
import { useEffect, useState } from "react";

enum StatusString {
  NotYet = "Not yet",
  Open = "Open",
  Over = "Over",
}

const scheduleStatus = (start_Date: string | undefined, end_Date: string | undefined) => {
  const now = new Date(formatDate(new Date())!)
  if (start_Date && (now < new Date(start_Date))) return StatusString.NotYet
  else if (end_Date && (now > new Date(end_Date))) return StatusString.Over
  return StatusString.Open
}

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


const ScheduleTable = (props: {
  list: Schedule[],
  selectedIds?: string[],
  onSelectSchedule?: (selectedIds: string[]) => void
}) => {
  const [list, setList] = useState<Schedule[]>([])
  useEffect(() => {
    setList(props.list)
    setSelectedIds([])
  }, [props.list])

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  useEffect(() => {
    if (props.selectedIds) setSelectedIds(props.selectedIds)
  }, [props.selectedIds])

  const handleSelect = (id: string) => {
    const newIdList = (selectedIds.includes(id)) ?
      selectedIds.filter(s => s != id)
      :
      [...selectedIds, id]
    setSelectedIds(newIdList)
    if (props.onSelectSchedule) props.onSelectSchedule(newIdList)
  }

  const handleSelectAll = () => {
    const newIdList = (selectedIds.length == list.length) ?
      []
      :
      list.map(sche => sche.id)
    setSelectedIds(newIdList)
    if (props.onSelectSchedule) props.onSelectSchedule(newIdList)
  }

  return (
    <Table singleLined striped basic={"very"} style={{ borderRadius: 0 }}>
      <TableHeader style={{ backgroundColor: "#43a047" }}>
        <TableRow style={{ color: "white" }}>
          <TableHeaderCell style={headerStyle} collapsing>
            <input type="checkbox"
              checked={selectedIds.length > 0 && selectedIds.length == list.length}
              onClick={handleSelectAll}
            />
          </TableHeaderCell>
          <TableHeaderCell style={headerStyle}>Vaccine</TableHeaderCell>
          <TableHeaderCell style={headerStyle}>Time</TableHeaderCell>
          <TableHeaderCell style={headerStyle}>Place</TableHeaderCell>
          <TableHeaderCell style={headerStyle}>Status</TableHeaderCell>
          <TableHeaderCell style={headerStyle}>Note</TableHeaderCell>
        </TableRow>
      </TableHeader>

      <TableBody>
        {
          listOrDefault(list.map(
            (schedule) =>
              <TableRow>
                <TableCell style={tableRowStye}>
                  <input type="checkbox"
                    checked={selectedIds.includes(schedule.id)}
                    onClick={() => handleSelect(schedule.id)}
                  />
                </TableCell>
                <TableCell style={tableRowStye}>{schedule.vaccine?.vaccine_Name}</TableCell>
                <TableCell style={tableRowStye}>From <strong>{formatDate(schedule.start_Date, '/', 1)}</strong> to <strong>{formatDate(schedule.end_Date, '/', 1)}</strong></TableCell>
                <TableCell style={tableRowStye}>{schedule.place?.name}</TableCell>
                <TableCell style={tableRowStye}>{scheduleStatus(schedule.start_Date, schedule.end_Date)}</TableCell>
                <TableCell style={tableRowStye}>{schedule.description}</TableCell>
              </TableRow>
          ))
        }
      </TableBody>
    </Table>
  )
}

export default ScheduleTable
