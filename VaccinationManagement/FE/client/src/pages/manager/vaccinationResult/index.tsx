import {
  Container,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Header,
  Segment,
  Input,
  Button,
  Pagination,
  Icon,
  SemanticICONS,
  SemanticCOLORS,
  Popup,
} from "semantic-ui-react";
import VaccinationResultService from "@/services/VaccinationResultService";
import { useEffect, useState, useRef, useCallback } from "react";
import message from '@/helpers/constants/message.json';
import { useNavigate } from "react-router-dom";
import { VaccinationResult } from "@/types/vaccinationResult";
import { PaginatedList, RoleBasedRender } from "@/helpers/utils";
import { formatDate } from "./utils/resultUtils";
import { VaccinationResultStatus } from "@/types/vaccinationResultStatus";
import { UserRole } from "@/types/userRole";

enum PopupType {
  confirmation,
  alert
}

enum StatusString {
  NotInjected = "Not Injected yet",
  Injected = "Injected",
  Cancelled = "Cancelled",
}

const StatusIcons: Record<number, { name: SemanticICONS | undefined, color: SemanticCOLORS }> = {}
StatusIcons[VaccinationResultStatus.NotInjected] = { name: undefined, color: "black" }
StatusIcons[VaccinationResultStatus.Injected] = { name: "check", color: "green" }
StatusIcons[VaccinationResultStatus.Cancelled] = { name: "close", color: "red" }

const StatusDropDownOptions = [
  { key: 0, value: VaccinationResultStatus.Injected, text: StatusString.Injected },
  { key: 1, value: VaccinationResultStatus.NotInjected, text: StatusString.NotInjected },
  { key: 2, value: VaccinationResultStatus.Cancelled, text: StatusString.Cancelled },
  { key: 3, value: -1, text: "All" }
]

// Amount of entries per page
const defaultPageSize = 5
// const pageSizeMin = 1
// const pageSizeMax = 30
// const pageSizeOptions = [...Array(pageSizeMax - pageSizeMin + 1).keys()]
//   .map((i) => ({ key: i, value: i + pageSizeMin, text: i + pageSizeMin }))

const pageSizeOptions = [
  { key: 1, value: 5, text: 5 },
  { key: 2, value: 10, text: 10 },
  { key: 3, value: 15, text: 15 }
]

// Length of the page selection bar
const pageBarSize = 7
// Displace the numbers on the page bar (mainly to place the current page at the center of the bar)
const pageBarDisplace = Math.floor(pageBarSize / 2)

// Display a message when the table is empty
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

// using style because classes gets overriden
const paddingStyle = { padding: "0.5rem" }
const headerStyle = { ...paddingStyle, color: "white", borderRadius: 0 }
const tableRowStye = { ...paddingStyle, border: 0 }

const ListVaccinationSchedule = () => {
  const navigate = useNavigate();
  const pageSize = useRef(defaultPageSize)
  const [vaccinationResultList, setVaccinationResultList] = useState<PaginatedList<VaccinationResult>>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    list: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedResults, setSelectedResults] = useState<VaccinationResult[]>([])
  const [isInjected, setIsInjected] = useState<VaccinationResultStatus | -1 | undefined>(VaccinationResultStatus.Injected);

  // const [showActive, setShowActive] = useState(true)

  const handlePageChange = useCallback(async (page: number) => {
    setSelectedIds([])
    const apiResponse = await VaccinationResultService.GetVaccinationResultsPaged(page, pageSize.current, (isInjected == -1) ? undefined : isInjected, searchQuery)
    const data: PaginatedList<VaccinationResult> = { ...apiResponse, list: apiResponse.injection_Results }
    if (data.currentPage > 1 && data.list.length < 1) handlePageChange(data.totalPages)
    else {
      setVaccinationResultList(data)
    }
  }, [isInjected, searchQuery])

  useEffect(() => {
    handlePageChange(1)
  }, [handlePageChange])

  const handlePageSizeChange = (_pageSize: number) => {
    pageSize.current = _pageSize
    handlePageChange(1)
  }

  const handleSelectStatus = (status: VaccinationResultStatus | undefined) => {
    setIsInjected(status);
    handlePageChange(vaccinationResultList.currentPage);
  }

  const handleSelect = (vacRes: VaccinationResult) => {
    // Cập nhật selectedIds
    setSelectedIds((prevIds) => {
      if (prevIds.includes(vacRes.id)) {
        return prevIds.filter((s) => s !== vacRes.id);
      } else {
        return [...prevIds, vacRes.id];
      }
    });

    // Cập nhật selectedResults
    setSelectedResults((prevResults) => {
      if (prevResults.includes(vacRes)) {
        return prevResults.filter((s) => s !== vacRes);
      } else {
        return [...prevResults, vacRes];
      }
    });
  };



  // Dùng useEffect để log sau khi trạng thái được cập nhật
  useEffect(() => {
    console.log('Updated selectedResults:', selectedResults);
  }, [selectedResults]);
  const handleSelectAll = () => {
    if (selectedIds.length == vaccinationResultList.list.length) setSelectedIds([])
    else setSelectedIds(vaccinationResultList.list.map(vr => vr.id))
  }

  // Range of the page bar
  let pageBarRange = [...Array(pageBarSize).keys()].map(i => i + vaccinationResultList.currentPage - pageBarDisplace)

  // Correct page bar values
  const low = pageBarRange[0]
  if (low < 1) pageBarRange = pageBarRange.map(i => i - low + 1)
  const high = pageBarRange[pageBarRange.length - 1]
  if (high > vaccinationResultList.totalPages) pageBarRange = pageBarRange.map(i => i - (high - vaccinationResultList.totalPages))

  // Display/hide popup
  const [popupDisplay, setPopupDisplay] = useState(false);
  // Change popup message
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<PopupType>(PopupType.alert);
  const [popupConfirmAction, setPopupConfirmAction] = useState<() => void>();

  // Handle what happens when "Update Vaccination Result" is pressed
  const handleUpdateSelectedItems = async (increment?: boolean) => {
    if (selectedIds.length < 1) {
      setPopupMessage(message["MSG 31"])
      setPopupType(PopupType.alert)
      setPopupDisplay(true)
    }
    else if (selectedIds.length > 1) {
      setPopupMessage(message["MSG 32"])
      setPopupType(PopupType.alert)
      setPopupDisplay(true)
    }
    else {
      const res = vaccinationResultList.list.find(res => res.id == selectedIds[0])
      if (res) {
        const apiResponse = await VaccinationResultService.GetNextVaccinationResult(res)
        const data: PaginatedList<VaccinationResult> = { ...apiResponse, list: apiResponse.injection_Results }

        if (increment && data.totalItems) {
          changeGuard(false, () => navigate("/vaccinationResult/edit/" + data.list[0].id), "The next appointment of the selected vaccination result already exists, would you like to edit the next appointment?")
        }
        else {
          if (!increment) navigate("/vaccinationResult/edit/" + selectedIds[0])
          else navigate("/vaccinationResult/increment/" + selectedIds[0])
        }
      }
    }
  }
  const handleUpdateStatus = (status?: VaccinationResultStatus) => {
    if (selectedIds.length < 1) {
      setPopupMessage(message["MSG 31"])
      setPopupType(PopupType.alert)
      setPopupDisplay(true)
    }
    else if (selectedIds.length > 1) {
      setPopupMessage(message["MSG 32"])
      setPopupType(PopupType.alert)
      setPopupDisplay(true)
    }
    else {
      changeGuard(false, async () => {
        await VaccinationResultService.UpdateStatus(selectedIds[0], status)
        const res = vaccinationResultList.list.find(res => res.id == selectedIds[0])
        if (res) {
          if (status == VaccinationResultStatus.Injected &&
            res.injection_Number != null &&
            res.number_Of_Injection != null &&
            res.injection_Number < res.number_Of_Injection
          )
            handleUpdateSelectedItems(true)
          else handlePageChange(vaccinationResultList.currentPage)
        }
      }, message["MSG 52"])
    }
  }

  const changeGuard = <T,>(condition: boolean, action: (params?: T) => void, message: string, params?: T) => {
    if (condition) action()
    else {
      setPopupType(PopupType.confirmation)
      setPopupMessage(message)
      if (params) setPopupConfirmAction(() => () => { setPopupDisplay(false); action(params); })
      else setPopupConfirmAction(() => () => { setPopupDisplay(false); action(); })
      setPopupDisplay(true)
    }
  }

  // Parameter for the "Showing a to b of n entries" line under the list
  const showingFrom = (vaccinationResultList.currentPage == 0) ? 0 : (vaccinationResultList.currentPage - 1) * pageSize.current + 1
  const showingTo = (vaccinationResultList.currentPage == 0) ? 0 : showingFrom + vaccinationResultList.list.length - 1

  useEffect(() => {
    handlePageChange(1)
  }, [searchQuery])

  return (
    <>
      <Container>
        <Header as='h2' textAlign="center">INJECTION RESULT LIST</Header>
        <Segment>
          <div className="flex justify-between mb-2">
            <div>
              <label htmlFor="entries" className="mr-2">Show</label>
              <select
                name="entries"
                className="border rounded p-1"
                onChange={(e) => { handlePageSizeChange(parseInt(e.target.value)) }}
                value={pageSize.current}
              >
                {pageSizeOptions.map((op) => <option value={op.value}>{op.text}</option>)}
              </select> entries
            </div>

            <div className="flex items-center space-x-4">
              {/*
              <Checkbox
              toggle
              onClick={handleToggleClick}
              label={'Injected'}
              checked={isInjected == VaccinationResultStatus.Injected}
              />
              */}
              <select
                name="entries"
                className="border rounded p-1"
                defaultValue={VaccinationResultStatus.Injected}
                onChange={(e) => { handleSelectStatus(parseInt(e.target.value)) }}
                value={isInjected}
              >
                {StatusDropDownOptions.map((op) => <option value={op.value}>{op.text}</option>)}
              </select>

              <div className="relative">
                <Input size='mini' icon={"search"} iconPosition='left' placeholder='Search...' onChange={(_, v) => setSearchQuery(v.value)} />
              </div>

            </div>
          </div>

          <Table singleLined striped basic={"very"} style={{ borderRadius: 0 }}>
            <TableHeader style={{ backgroundColor: "#43a047" }}>
              <TableRow style={{ color: "white" }}>
                <TableHeaderCell style={headerStyle} collapsing>
                  <input type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length == vaccinationResultList.list.length}
                    onClick={handleSelectAll}
                  />
                </TableHeaderCell>
                <TableHeaderCell style={headerStyle}>Customer</TableHeaderCell>
                <TableHeaderCell style={headerStyle}>Vaccine Name</TableHeaderCell>
                <TableHeaderCell style={headerStyle}>Prevention</TableHeaderCell>
                <TableHeaderCell style={headerStyle}>Number of Injections</TableHeaderCell>
                <TableHeaderCell style={headerStyle}>Injections No.</TableHeaderCell>
                <TableHeaderCell style={headerStyle}>Date of inject</TableHeaderCell>
                <TableHeaderCell style={headerStyle}>Next inject date</TableHeaderCell>
                <TableHeaderCell style={headerStyle}>Injected</TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {
                listOrDefault(vaccinationResultList?.list.map(
                  (vacRes) =>
                    <TableRow>
                      <TableCell style={tableRowStye}>
                        <input type="checkbox"
                          checked={selectedIds.includes(vacRes.id)}
                          onClick={() => handleSelect(vacRes)}
                        />

                      </TableCell>
                      <TableCell style={tableRowStye}>{vacRes.customer?.identity_Card
                        + '-' + vacRes.customer?.full_Name
                        + '-' + formatDate(vacRes.customer?.date_Of_Birth)}
                      </TableCell>
                      <TableCell style={tableRowStye}>{vacRes.vaccine?.vaccine_Name}</TableCell>
                      <TableCell style={tableRowStye}>{vacRes.prevention}</TableCell>
                      <TableCell style={tableRowStye}>{vacRes.number_Of_Injection}</TableCell>
                      <TableCell style={tableRowStye}>{vacRes.injection_Number}</TableCell>
                      <TableCell style={tableRowStye}>{formatDate(vacRes.injection_Date, '/', 1)}</TableCell>
                      <TableCell style={tableRowStye}>{
                        (vacRes.next_Injection_Date) ?
                          formatDate(vacRes.next_Injection_Date, '/', 1)
                          :
                          <Icon name={"dont"} />
                      } </TableCell>
                      <TableCell style={tableRowStye}><Icon name={StatusIcons[vacRes.isVaccinated].name} color={StatusIcons[vacRes.isVaccinated].color} /></TableCell>
                    </TableRow>
                ))
              }
            </TableBody>

          </Table>

          <div className="flex justify-between mb-2">
            <div>
              <Container fluid>
                <p>Showing {showingFrom} to {showingTo} of {vaccinationResultList.totalItems} entries</p>

                <RoleBasedRender render={(role) =>
                  (role == UserRole.Admin || role == UserRole.Employee) ?
                    <>
                      <Button size="tiny" color='teal' style={{ marginRight: '3px' }} inline onClick={() => navigate('create')}>New Injection Result</Button>
                      <Button size="tiny" color='blue' inline onClick={() => handleUpdateSelectedItems(true)}>Increment Injection Result</Button>
                      <Button size="tiny" color='orange' inline onClick={() => handleUpdateSelectedItems()} disabled={isInjected != VaccinationResultStatus.NotInjected}>Update Injection Result</Button>

                      <Popup
                        content={`Change status of the selected vaccination result from "${StatusString.NotInjected}" to "${StatusString.Injected}"`}
                        trigger={<span><Button size="tiny" color='green' inline onClick={() => handleUpdateStatus(VaccinationResultStatus.Injected)} disabled={isInjected != VaccinationResultStatus.NotInjected}>Update Status</Button></span>}
                      />

                      <Popup
                        content={`Change status of the selected vaccination result from "${StatusString.NotInjected}" to "${StatusString.Cancelled}"`}
                        trigger={<span><Button size="tiny" color='red' inline onClick={() => handleUpdateStatus(VaccinationResultStatus.Cancelled)} disabled={isInjected != VaccinationResultStatus.NotInjected}>Cancel Result</Button></span>}
                      />
                    </>
                    :
                    null
                }
                  defaultRender={(error) =>
                    <p className="text-red-500"> {error} </p>
                  }
                />

              </Container>
            </div>

            <div>
              <Pagination
                defaultActivePage={1}
                size='mini'
                floated="right"
                boundaryRange={0}
                firstItem={null}
                lastItem={null}
                siblingRange={1}
                totalPages={vaccinationResultList.totalPages}
                activePage={vaccinationResultList.currentPage}
                prevItem={{ content: '«' }}
                nextItem={{ content: '»' }}
                onPageChange={(_, p) => handlePageChange(p.activePage as number)}
              />
            </div>
          </div>

        </Segment>
      </Container>

      {popupDisplay && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>{popupMessage}</p>
            <div className="mt-4 text-center">
              {(popupType == PopupType.alert) ?
                <button
                  className="mx-2 px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={() => { setPopupDisplay(false) }}
                >
                  OK
                </button>
                :
                <>
                  <button
                    className="mx-2 px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => {
                      if (popupConfirmAction) {
                        popupConfirmAction()
                      }
                    }}
                  >
                    Yes
                  </button>

                  <button
                    className="mx-2 px-4 py-2 bg-red-500 text-white rounded"
                    onClick={() => { setPopupDisplay(false) }}
                  >
                    No
                  </button>
                </>
              }

            </div>
          </div>
        </div>
      )}

    </>
  );
};
export default ListVaccinationSchedule
