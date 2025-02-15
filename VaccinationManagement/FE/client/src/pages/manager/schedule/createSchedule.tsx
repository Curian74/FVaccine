import { SyntheticEvent, useEffect, useRef, useState } from "react"
import {
  Container,
  Header,
  Segment,
  Form,
  FormSelect,
  FormButton,
  Grid,
  GridRow,
  GridColumn,
  Pagination,
  Card,
  CardContent,
  CardHeader,
  Message,
  Label,
} from "semantic-ui-react"
import { useNavigate } from "react-router-dom"
import { AxiosError } from "axios"
import { Vaccine } from "@/types/vaccine"
import { Schedule } from "@/types/schedule"
import { Distribution } from "@/types/distribution"
import VaccineService from "@/services/VaccineService"
import ScheduleService from "@/services/ScheduleService"
import message from '@/helpers/constants/message.json';
import FormatId from '@/helpers/constants/FormatID.json'
import { PaginatedList } from "@/helpers/utils"
import { dateOnly, dropdownEntry, formatDate, vaccineDropdownText } from "./utils/scheduleUtils"
import Datepicker from 'react-semantic-ui-datepickers';
import { SemanticDatepickerProps } from "react-semantic-ui-datepickers/dist/types"
import DistributionTable from "./components/DistributionTable"
// import { Visibility, Loader } from "semantic-ui-react"

const { GetLatestSchedule } = ScheduleService
const Submit = ScheduleService.CreateSchedule

enum PopupType {
  confirmation = 0,
  alert = 1
}

const entriesPerFetch = 10
const fetchDelayms = 500

const CreateSchedule = () => {
  const navigate = useNavigate()

  const [popupDisplay, setPopupDisplay] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<PopupType>(PopupType.alert);
  const [popupConfirmAction, setPopupConfirmAction] = useState<() => void>();

  const [novac, setNovac] = useState(false)


  /*
   * Handle form values and actions
   */
  const [formValue, setFormValue] = useState<Schedule>({
    description: '',
    end_Date: '',
    place_Id: '',
    start_Date: '',
    vaccine_Id: '',
    id: ''
  })
  const [edited, setEdited] = useState(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEdited(true)
    setFormValue({ ...formValue, [e.target.name]: e.target.value });
  };

  const handleSelectVaccine = async (_: SyntheticEvent, dropDownProps: { value?: string | number | boolean | (string | number | boolean)[] | undefined }) => {
    setEdited(true)
    const vac = vaccineDropdownEntries.current.find(vac => vac.id === dropDownProps.value?.toString())
    if (vac) {
      setSelectedVaccine(vac)
      setFormValue((prev) => {
        return { ...prev, vaccine_Id: dropDownProps.value?.toString() ?? '', place_Id: '', start_Date: '', end_Date: '' }
      });

      // Reset distribution dropdown
      setSelectedDistribution(undefined)
      const apiResponse = await VaccineService.GetVaccineDistributionsGroupedByVacAndPlace(
        1,
        entriesPerFetch,
        vac.id,
        undefined,
        undefined,
        vac.time_Begin_Next_Injection,
        vac.time_End_Next_Injection,
        undefined,
        1
      );
      const data: PaginatedList<Distribution> = { ...apiResponse, list: apiResponse.distributions }
      setDistributionList(data)
    }
  }

  const handleSelectDate = (_: SyntheticEvent | undefined, data?: SemanticDatepickerProps) => {
    setDateSelectError(undefined)
    const val = data?.value
    if (val instanceof Array && val[0]) {
      if (formValue.start_Date &&
        new Date(formValue.start_Date) == val[0] ||
        formValue.end_Date &&
        new Date(formValue.end_Date) == val[0]
      )
        setEdited(true)
      setFormValue((prev) => { return ({ ...prev, start_Date: formatDate(val[0]), end_Date: (val[1] instanceof Date) ? formatDate(val[1]) : '' }) });
    }
    else {
      setFormValue((prev) => { return ({ ...prev, start_Date: '', end_Date: '' }) });
    }
  }

  const handleFormReset = async () => {
    setEdited(false)
    setVaccineSelectError(undefined)
    setPlaceSelectError(undefined)
    setDateSelectError(undefined)
    const latestId = await getLatestScheduleId()
    setFormValue({
      description: '',
      end_Date: formatDate(new Date()),
      place_Id: '',
      start_Date: formatDate(new Date()),
      vaccine_Id: '',
      id: latestId
    });

    handleChangeDistributionPage(1)
  };

  // Locks the form when set, used when the form submit successfully
  const handleSubmitForm = async () => {
    if (validateForm()) {
      try {
        await Submit(formValue)
        handleFormReset()
        setPopupType(PopupType.alert)
        setPopupMessage(message["MSG 23"])
        setPopupDisplay(true)
        // setSuccessLock(true)
      }
      catch (err) {
        console.log(err)
      }
    }
  }


  /*
   * Handle form validation
   */
  const [vaccineSelectError, setVaccineSelectError] = useState<string | undefined>(undefined)
  const [placeError, setPlaceSelectError] = useState<string | undefined>(undefined)
  const [dateError, setDateSelectError] = useState<string | undefined>(undefined)

  const validateForm = () => {
    let valid = true
    if (formValue.vaccine_Id.length < 1) {
      setVaccineSelectError("Please select a valid vaccine.")
      valid = false
    }

    if (formValue.place_Id.length < 1) {
      setPlaceSelectError("Please select a place.")
      valid = false
    }

    const startDate = new Date(formValue.start_Date ?? '')
    const endDate = new Date(formValue.end_Date ?? '')
    const validStartDate = startDate instanceof Date && !isNaN(startDate.valueOf())
    const validEndDate = endDate instanceof Date && !isNaN(endDate.valueOf())
    if (!validStartDate && !validEndDate) {
      setDateSelectError("Please select dates.")
      valid = false
    }
    else if (!validStartDate) {
      setDateSelectError("Please select start date.")
      valid = false
    }
    else if (!validEndDate) {
      setDateSelectError("Please select end date.")
      valid = false
    }

    return valid
  }


  /*
   * Handle fetching vaccines for the vaccine select drop down (paginated)
   */
  const vaccineDropDownPageIndex = useRef(0)
  // The fetched vaccines
  const vaccineDropdownEntries = useRef<Vaccine[]>([])
  // The actual element that the dropdown uses to display the vaccines
  const [vaccineDropdown, setVaccineDropdown] = useState<dropdownEntry[]>([])
  const [vaccineQuery, setVaccineQuery] = useState('')
  const [vaccineDropdownLoading, setVaccineDropdownLoading] = useState(false)
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine>()

  // The element that calls the fetchVaccines method on certain conditions (intended to load more as soon as the user scrolls down to the botton of the list, settled for just a button that fetchs more)
  const LoadVaccineObject = () => {
    return (
      <Header as={'h5'} textAlign="center" onClick={fetchVaccines}>
        ...Load more...
      </Header>
    )
  }

  const fetchVaccines = async () => {
    setVaccineDropdownLoading(true)
    const data = await VaccineService.GetVaccines(
      vaccineDropDownPageIndex.current + 1,
      entriesPerFetch,
      vaccineQuery,
      true
    );
    // Handle edge case when system does not have any vaccines
    if (vaccineQuery === '' && data.totalItems == 0) {
      setPopupType(PopupType.confirmation)
      setPopupMessage(message["MSG 38"])
      setPopupConfirmAction(() => () => navigate("/vaccine/create"))
      setNovac(true)
      setPopupDisplay(true)
    }
    // console.log(data)
    vaccineDropDownPageIndex.current++
    vaccineDropdownEntries.current = vaccineDropdownEntries.current.concat(data.vaccines)
    let newEntries: dropdownEntry[] = vaccineDropdownEntries.current.filter((vaccine) => vaccine.id != formValue.vaccine_Id).map((vaccine) => (
      {
        key: vaccine.id,
        text: vaccineDropdownText(vaccine),
        value: vaccine.id,
      }
    ))
    if (selectedVaccine) {
      newEntries = [{ key: selectedVaccine.id, value: selectedVaccine.id, text: vaccineDropdownText(selectedVaccine) }, ...newEntries]
    }

    if (vaccineDropdownEntries.current.length < data.totalVaccines) newEntries.push(
      {
        key: '',
        content: <LoadVaccineObject />,
        disabled: true
      }
    )
    setVaccineDropdownLoading(false)
    setVaccineDropdown(newEntries)
  }

  useEffect(() => {
    setVaccineDropdownLoading(true)
    const timer = setTimeout(() => {
      vaccineDropDownPageIndex.current = 0
      vaccineDropdownEntries.current = []
      const wrap = async () => {
        await fetchVaccines()
        setVaccineDropdownLoading(false)
      }
      wrap();
    }, fetchDelayms);
    return () => clearTimeout(timer);
  }, [vaccineQuery])


  /*
   * Handle fetching places for the distribution select list (paginated)
   */
  const [distributionList, setDistributionList] = useState<PaginatedList<Distribution>>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    list: []
  })

  const [selectedDistribution, setSelectedDistribution] = useState<Distribution>()

  const handleChangeDistributionPage = async (page: number) => {
    if (selectedVaccine) {
      const apiResponse = await VaccineService.GetVaccineDistributionsGroupedByVacAndPlace(
        page,
        entriesPerFetch,
        selectedVaccine.id,
        undefined,
        undefined,
        selectedVaccine.time_Begin_Next_Injection,
        selectedVaccine.time_End_Next_Injection,
        undefined,
        1
      );
      const data: PaginatedList<Distribution> = { ...apiResponse, list: apiResponse.distributions }
      setDistributionList(data)

    }
  }

  const handleSelectDistribution = (dist: Distribution) => {
    setEdited(true)
    setPlaceSelectError("")
    setSelectedDistribution(dist)
    setFormValue({ ...formValue, place_Id: dist?.place_Id ?? '' });
  }

  const showingFrom = (distributionList.currentPage == 0) ? 0 : (distributionList.currentPage - 1) * entriesPerFetch + 1
  const showingTo = (distributionList.currentPage == 0) ? 0 : showingFrom + distributionList.list.length - 1

  /*
   * Initial render
   */

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

  const getLatestScheduleId = async () => {
    try {
      const apiResponse = await GetLatestSchedule()
      const preFix: string = apiResponse.id.substring(0, 2)
      const surFix: string = apiResponse.id.substring(2)
      return preFix + ((parseInt(surFix) + 1) + '').padStart(surFix.length, '0')
    }
    catch (err) {
      if (err instanceof AxiosError && err.status == 404) {
        const id = FormatId["VaccinationSchedule"]
        const preFix: string = id.substring(0, 2)
        const surFix: string = id.substring(2)
        return preFix + ((parseInt(surFix) + 1) + '').padStart(surFix.length, '0')
      }
      // panik
      console.log(err)
      return ''
    }
  }

  useEffect(() => {
    handleFormReset()
  }, [])

  const dateCmp = (d1: Date, d2: Date) => {
    console.log(d1)
    console.log(d2)
    console.log(d1 >= d2)
    if (d1 >= d2) return d1
    return d2
  }
  const minDate = dateOnly(dateCmp(new Date(selectedVaccine?.time_Begin_Next_Injection.toString() ?? Date.now()), new Date()))
  console.log(minDate)
  const maxDate = new Date(selectedVaccine?.time_End_Next_Injection.toString() ?? '')


  return (
    <>
      <Container>
        <Header as='h2' textAlign="center">CREATE INJECTION SCHEDULE</Header>
        <Segment>
          <Form onSubmit={handleSubmitForm} error={!!placeError}>
            <Grid>
              <GridRow>
                <GridColumn width={8}>
                  <FormSelect
                    label={<span>Vaccine <p className="text-red-500 inline">(*)</p></span>}
                    options={vaccineDropdown}
                    placeholder={selectedVaccine?.vaccine_Name ?? '-Select Vaccine'}
                    lazyLoad
                    name='vaccine_Id'
                    value={formValue.vaccine_Id}
                    onChange={(e, v) => { handleSelectVaccine(e, v); setVaccineSelectError(undefined) }}
                    error={vaccineSelectError}
                    search={() => { return vaccineDropdown.filter(vac => vac.key != formValue.vaccine_Id || vac.text?.includes(vaccineQuery)) }}
                    loading={vaccineDropdownLoading}
                    onSearchChange={(_, v) => setVaccineQuery(v.searchQuery)}
                    onClose={() => setVaccineQuery('')}
                  />
                </GridColumn>

                <GridColumn width={8} stretched>
                  <Datepicker
                    label={
                      <span>
                        Date <p className="text-red-500 inline">(*)</p>
                        {selectedVaccine && <p className="text-gray-500 inline">  Must be between {formatDate(minDate, '/', 1)} and {formatDate(maxDate, '/', 1)}</p>}
                      </span>
                    }
                    type="range"
                    value={(formValue.start_Date && formValue.end_Date) ? [new Date(formValue.start_Date), new Date(formValue.end_Date)] : null}
                    minDate={minDate}
                    maxDate={(selectedVaccine?.time_End_Next_Injection) ? new Date(selectedVaccine.time_End_Next_Injection.toString()) : undefined}
                    onChange={handleSelectDate}
                    placeholder="Select Date Range"
                    format="DD/MM/YYYY"
                    error={dateError}
                  />
                  {dateError &&
                    <Label basic color='red' pointing> {dateError} </Label>
                  }
                </GridColumn>


                {/*
                <GridColumn width={6}>
                  <FormSelect
                    label={<span>Place <p className="text-red-500 inline">(*)</p></span>}
                    options={distributionDropdown}
                    placeholder={selectedDistribution?.place?.name ?? '-Select Place'}
                    lazyLoad
                    disabled={!hasAVaccineBeenSelected}
                    name='place_Id'
                    value={(selectedDistribution) ? selectedDistribution.id : ''}
                    onChange={(e, v) => { handleSelectPlace(e, v); setPlaceSelectError(undefined) }}
                    error={placeError}
                    search={() => { return distributionDropdown.filter(place => place.key != formValue.place_Id || place.text?.includes(placeQuery)) }}
                    loading={distributionDropdownLoading}
                    onSearchChange={(_, v) => setPlaceQuery(v.searchQuery)}
                    onClose={() => setPlaceQuery('')}
                    onOpen={() => { if (distributionDropdownEntries.current.length < 1) fetchPlaces() }}
                  />
                </GridColumn>
                */}

              </GridRow>

              <GridRow>
                <GridColumn width={16}>
                  <Form.TextArea
                    label='Note'
                    placeholder='Note'
                    name='description'
                    value={formValue.description}
                    onChange={handleChange}
                  />
                </GridColumn>

              </GridRow>

              <GridRow>
                <Card fluid style={{ margin: "1em" }}>
                  <CardContent>
                    <CardHeader>Select Distribution <p className="text-red-500 inline">(*)</p></CardHeader>
                  </CardContent>
                  <CardContent>
                    <DistributionTable
                      list={distributionList.list}
                      selectedId={selectedDistribution?.id}
                      onSelectDistribution={(selectId) => {
                        const dist = distributionList.list.find(dist => dist.id == selectId)
                        if (dist) handleSelectDistribution(dist)
                      }}
                    />
                    <div className="flex justify-between mb-2">
                      <div>
                        <Container fluid>
                          <p>Showing {showingFrom} to {showingTo} of {distributionList.totalItems} entries</p>
                        </Container>
                      </div>

                      <div>
                        <Pagination
                          defaultActivePage={1}
                          size='small'
                          floated="right"
                          totalPages={distributionList.totalPages}
                          onPageChange={(_, p) => handleChangeDistributionPage(p.activePage as number)}
                        />
                      </div>
                    </div>
                    <Message error>
                      Please Select a distribution
                    </Message>
                  </CardContent>
                </Card>
              </GridRow>


              <GridRow>
                <Container className="p-2">
                  <FormButton color='green' style={{ marginLeft: "3px" }} disabled={!edited} inline>
                    Save
                  </FormButton>
                  <FormButton color='blue' style={{ marginLeft: "3px" }} inline type="button"
                    onClick={() => changeGuard(!edited, handleFormReset, message["MSG 44"])}
                  >
                    Reset
                  </FormButton>
                  <FormButton color='orange' style={{ marginLeft: "3px" }} inline type="button"
                    onClick={() => changeGuard(!edited, () => navigate('/schedule'), message["MSG 48"])}
                  >
                    Cancel
                  </FormButton>
                </Container>
              </GridRow>
            </Grid>
          </Form>
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
                    onClick={() => {
                      if (novac) navigate("/schedule")
                      else setPopupDisplay(false)
                    }}
                  >
                    {(novac) ? "Go back to schedule list" : "No"}
                  </button>
                </>
              }

            </div>
          </div>
        </div>
      )}
    </>

  )
}

export default CreateSchedule
