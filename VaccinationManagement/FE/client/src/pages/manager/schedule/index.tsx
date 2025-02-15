import {
  Container,
  Header,
  Segment,
  Input,
  Button,
  Pagination,
} from "semantic-ui-react";
import ScheduleService from "@/services/ScheduleService";
import { useEffect, useState, useRef } from "react";
import { Schedule } from "@/types/schedule";
import message from '@/helpers/constants/message.json';
import { useNavigate } from "react-router-dom";
import { PaginatedList, RoleBasedRender } from "@/helpers/utils";
import { ScheduleStatus as StatusValue } from "@/types/scheduleStatus";
import ScheduleTable from "./components/ScheduleTable";
import { UserRole } from "@/types/userRole";

const { GetSchedulesPaged } = ScheduleService

enum StatusString {
  NotYet = "Not yet",
  Open = "Open",
  Over = "Over",
}

const StatusDropDownOptions = [
  { key: 0, value: StatusValue.Open, text: StatusString.Open },
  { key: 1, value: StatusValue.NotYet, text: StatusString.NotYet },
  { key: 2, value: StatusValue.Over, text: StatusString.Over },
  { key: 3, value: -1, text: "All" }
]

// Amount of entries per page
const defaultPageSize = 5
// const pageSizeMin = 3
// const pageSizeMax = 30
// const pageSizeOptions = [...Array(pageSizeMax - pageSizeMin + 1).keys()]
//   .map((i) => ({ key: i, value: i + pageSizeMin, text: i + pageSizeMin }))

const pageSizeOptions = [
  { key: 1, value: 5, text: 5 },
  { key: 2, value: 10, text: 10 },
  { key: 3, value: 15, text: 15 }
]

// using style because classes gets overriden
const ListSchedule = () => {
  const navigate = useNavigate();
  const pageSize = useRef(defaultPageSize)
  const [scheduleList, setScheduleList] = useState<PaginatedList<Schedule>>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    list: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [fetchScheduleStatus, setFetchScheduleStatus] = useState(StatusValue.Open)

  const handlePageChange = (page: number) => {
    setSelectedIds([])
    GetSchedulesPaged(page, pageSize.current, searchQuery, fetchScheduleStatus).then((apiResponse) => setScheduleList({ ...apiResponse, list: apiResponse.injection_Schedules }))
  }

  const handlePageSizeChange = (_pageSize: number) => {
    pageSize.current = _pageSize
    handlePageChange(1)
  }

  // Display/hide popup
  const [popupDisplay, setPopupDisplay] = useState(false);
  // Change popup message
  const [popupMessage, setPopupMessage] = useState('');

  const handleUpdateSelectedSchedule = () => {
    if (selectedIds.length < 1) {
      setPopupMessage(message["MSG 31"])
      setPopupDisplay(true)
    }
    else if (selectedIds.length > 1) {
      setPopupMessage(message["MSG 32"])
      setPopupDisplay(true)
    }
    else {
      navigate("/schedule/edit/" + selectedIds[0])
    }
  }

  const showingFrom = (scheduleList.currentPage == 0) ? 0 : (scheduleList.currentPage - 1) * pageSize.current + 1
  const showingTo = (scheduleList.currentPage == 0) ? 0 : showingFrom + scheduleList.list.length - 1

  // Init page 1 + reload the table when searchQuery changes
  useEffect(() => {
    handlePageChange(1)
  }, [searchQuery, fetchScheduleStatus])

  return (
    <>
      <Container>
        <Header as='h2' textAlign="center">INJECTION SCHEDULE LIST</Header>
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
              <select
                name="entries"
                className="border rounded p-1"
                defaultValue={StatusValue.Open}
                onChange={(e) => { setFetchScheduleStatus(parseInt(e.target.value)) }}
                value={fetchScheduleStatus}
              >
                {StatusDropDownOptions.map((op) => <option value={op.value}>{op.text}</option>)}
              </select>
              <div className="relative">
                <Input size='mini' icon={"search"} iconPosition='left' placeholder='Search...' onChange={(_, v) => setSearchQuery(v.value)} />
              </div>
            </div>
          </div>

          <ScheduleTable
            list={scheduleList.list}
            onSelectSchedule={(idList) => setSelectedIds(idList)}
          />

          <div className="flex justify-between mb-2">
            <div>
              <Container fluid>
                <p>Showing {showingFrom} to {showingTo} of {scheduleList.totalItems} entries</p>

                <RoleBasedRender render={(role) =>
                  (role == UserRole.Admin || role == UserRole.Employee) ?
                    <>
                      <Button color='teal' style={{ marginRight: '3px' }} onClick={() => navigate('create')}>New Injection Schedules</Button>
                      <Button color='orange' onClick={handleUpdateSelectedSchedule}>Update Injection Schedules</Button>
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
                totalPages={scheduleList.totalPages}
                activePage={scheduleList.currentPage}
                prevItem={{ content: '«' }}
                nextItem={{ content: '»' }}
                onPageChange={(_, p) => handlePageChange(p.activePage as number)}
              />
            </div>
          </div>

        </Segment>
      </Container>


      {popupDisplay && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>{popupMessage}</p>
            <div className="mt-4 text-center">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => { setPopupDisplay(false) }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default ListSchedule
