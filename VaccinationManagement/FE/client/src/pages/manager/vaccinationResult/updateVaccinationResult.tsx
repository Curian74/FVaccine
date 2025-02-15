import { SyntheticEvent, useEffect, useRef, useState } from "react"
import {
  Container,
  Header,
  Segment,
  Form,
  FormInput,
  FormSelect,
  FormButton,
  Grid,
  GridRow,
  GridColumn,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Pagination,
  Message,
  Card,
  CardContent,
  CardHeader,
  Label,
  Popup,
} from "semantic-ui-react"
import { useNavigate, useParams } from "react-router-dom"
import { Vaccine } from "@/types/vaccine"
import { Schedule } from "@/types/schedule"
import { Place } from "@/types/place"
import { Customer } from "@/types/user"
import VaccineService from "@/services/VaccineService"
import ScheduleService from "@/services/ScheduleService"
import CustomerService from "@/services/CustomerService"
import VaccinationResultService from "@/services/VaccinationResultService"
import message from '@/helpers/constants/message.json';
import FormatId from '@/helpers/constants/FormatID.json'
import { PaginatedList } from "@/helpers/utils"
import { dateOnly, dropdownEntry, formatDate } from "./utils/resultUtils"
import { VaccinationResult } from "@/types/vaccinationResult"
import { VaccineType } from "@/types/vaccineType"
import VaccineTypeService from "@/services/VaccineTypeService"
import { VaccinationResultStatus } from "@/types/vaccinationResultStatus";
import { AxiosError } from "axios"
import Datepicker from 'react-semantic-ui-datepickers';
import { SemanticDatepickerProps } from "react-semantic-ui-datepickers/dist/types"
import './utils/customInputStyle.css';

// import { Visibility, Loader } from "semantic-ui-react"
const { GetSchedulesPaged } = ScheduleService
const { GetVaccinationResultById, GetLatestVaccinationResult } = VaccinationResultService
const Submit = VaccinationResultService.UpdateVaccinationResult
const SubmitIncrement = VaccinationResultService.CreateVaccinationResult

const DROPDOWN_PAGESIZE = 10
const DROPDOWN_FETCHDELAY_MS = 500

enum PopupType {
  confirmation = 0,
  alert = 1
}

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

const getLatestResultId = async () => {
  try {
    const apiResponse = await GetLatestVaccinationResult()
    const preFix: string = apiResponse.id.substring(0, 2)
    const surFix: string = apiResponse.id.substring(2)
    return preFix + ((parseInt(surFix) + 1) + '').padStart(surFix.length, '0')
  }
  catch (err) {
    if (err instanceof AxiosError && err.status == 404) {
      const id = FormatId["VaccinationResult"]
      const preFix: string = id.substring(0, 2)
      const surFix: string = id.substring(2)
      return preFix + ((parseInt(surFix) + 1) + '').padStart(surFix.length, '0')
    }
    // panik
    console.log(err)
    return ''
  }
}

const UpdateVaccinationResult = (params: {
  increment?: boolean
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()

  const [popupDisplay, setPopupDisplay] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<PopupType>(PopupType.alert);
  const [popupConfirmAction, setPopupConfirmAction] = useState<() => void>();
  const [scheduleList, setScheduleList] = useState<PaginatedList<Schedule>>({
    currentPage: 0,
    totalItems: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    list: []
  })
  const [novac, setNovac] = useState(false)
  const [finalInjection, setFinalInjection] = useState(false)

  const customerDropDownPageIndex = useRef(0)
  const customerDropdownEntries = useRef<Customer[]>([])
  const [customerDropdown, setCustomerDropdown] = useState<dropdownEntry[]>([])
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerDropdownLoading, setCustomerDropdownLoading] = useState(false)
  const [defaultCustomer, setSelectedCustomer] = useState<Customer>()
  const vaccineDropDownPageIndex = useRef(0)
  const vaccineDropdownEntries = useRef<Vaccine[]>([])
  const [vaccineDropdown, setVaccineDropdown] = useState<dropdownEntry[]>([])
  const [vaccineQuery, setVaccineQuery] = useState('')
  const [vaccineDropdownLoading, setVaccineDropdownLoading] = useState(false)
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine>()
  const [selectedShedule, setSelectedShedule] = useState<Schedule>()
  const [selectedPlace, setSelectedPlace] = useState<Place>()

  // TODO: Add schedule list exclude range
  const [prevResultNextDate, setPrevResultNextDate] = useState<Date>()

  const paddingStyle = { padding: "0.5rem" }
  const headerStyle = { ...paddingStyle, color: "white", borderRadius: 0 }
  const tableRowStye = { ...paddingStyle, border: 0 }

  // Might add a step to check if the result of the next injection has already been created or not
  const leavingAfterIncrementing = useRef(false)

  const handlePageChange = (page: number, vaccineName?: string) => {
    // setSelectedIds([])
    GetSchedulesPaged(page, 5, vaccineName, 1, formValue.vaccine_Id).then((apiResponse) => setScheduleList({ ...apiResponse, list: apiResponse.injection_Schedules }))
  }

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
  /*
   * Handle form values and actions
   */
  const [formValue, setFormValue] = useState<VaccinationResult>({
    id: '',
    customer_Id: '',
    injection_Date: '',
    next_Injection_Date: '',
    injection_Place_Id: '',
    number_Of_Injection: 0,
    injection_Number: 0,
    prevention: '',
    vaccine_Id: '',
    isVaccinated: VaccinationResultStatus.NotInjected
  })

  const [edited, setEdited] = useState(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEdited(true)
    setFormValue(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSelectCustomer = (_: SyntheticEvent, dropDownProps: { value?: string | number | boolean | (string | number | boolean)[] | undefined }) => {
    setEdited(true)
    setFormValue(prev => ({ ...prev, customer_Id: dropDownProps.value?.toString() ?? '' }));
  }

  useEffect(() => {
    handlePageChange(1, selectedVaccine?.vaccine_Name)
    if (selectedVaccine) {
      setFormValue(prev => ({
        ...prev,
        vaccine_Id: selectedVaccine.id,
        number_Of_Injection: selectedVaccine.required_Injections,
      }));
    }
  }, [selectedVaccine])

  const handleSelectPrevention = (id: string) => {
    setEdited(true)
    const prevention = preventionDropdownEntries.current.find(prevention => prevention.id === id)
    if (prevention) {
      setSelectedPrevention(prevention)
      setFormValue(prev => ({ ...prev, prevention: prevention.vaccine_Type_Name, vaccine_Id: '' }));
      setPreventionSelectError(undefined)

      // Reset vaccine dropdown
      setSelectedVaccine(undefined)
      vaccineDropDownPageIndex.current = 0
      vaccineDropdownEntries.current = []
      fetchVaccines(true, prevention.id)
    }
  }

  const handleSelectVaccine = async (_: SyntheticEvent, vaccineId: { value?: string | number | boolean | (string | number | boolean)[] | undefined }) => {
    setEdited(true)
    const id = vaccineId.value?.toString()

    if (id) {
      const vac = await VaccineService.GetVaccineById(id)
      console.log(vac)
      if (vac) {
        setSelectedVaccine(vac)
        setSelectedShedule(undefined)
        setSelectedPlace(undefined)
      }
    }
  }

  const handleSelectInjectionDate = (_: SyntheticEvent | undefined, data?: SemanticDatepickerProps) => {
    setEdited(true)
    setStartDateError(undefined)

    const val = data?.value
    if (val instanceof Date) {
      setFormValue(prev => ({ ...prev, injection_Date: formatDate(val), next_Injection_Date: '' }));
    }
    else {
      setFormValue(prev => ({ ...prev, injection_Date: '', next_Injection_Date: '' }));
    }
  }

  const handleSelectNextInjectionDate = (_: SyntheticEvent | undefined, data?: SemanticDatepickerProps) => {
    setEdited(true)
    setEndDateError(undefined)

    const val = data?.value
    if (val instanceof Date) {
      setFormValue(prev => ({ ...prev, next_Injection_Date: formatDate(val) }));
    }
    else {
      setFormValue(prev => ({ ...prev, next_Injection_Date: '' }));
    }
  }

  const [minDate, setMinDate] = useState<Date | undefined>(undefined)
  const [minNextDate, setMinNextDate] = useState<Date | undefined>(undefined)
  const [maxDate, setMaxDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (selectedShedule) {
      if (selectedShedule.start_Date) {
        const startDate = new Date(selectedShedule.start_Date)
        if (params.increment && prevResultNextDate && startDate < prevResultNextDate) setMinDate(dateOnly(prevResultNextDate))
        else setMinDate(dateOnly(startDate))
      }
      if (selectedShedule.end_Date) setMaxDate(new Date(selectedShedule.end_Date))
      setFormValue(prev => ({
        ...prev,
        injection_Date: '',
        next_Injection_Date: '',
      }))
    }
  }, [selectedShedule])

  useEffect(() => {
    const val = (formValue.injection_Date) ? new Date(formValue.injection_Date) : undefined
    if (selectedVaccine?.time_Between_Injections && val) {
      setMinNextDate(new Date(val.getFullYear(), val.getMonth(), val.getDate() + selectedVaccine.time_Between_Injections))
    }
  }, [formValue.injection_Date, selectedVaccine?.time_Between_Injections])

  const handleSelectSchedule = async (id: string) => {
    const schedule = scheduleList.list.find(sche => sche.id == id)
    if (schedule) {
      setEdited(true)

      setSelectedShedule(schedule)
      setScheduleSelectError(undefined)
      setSelectedPlace(schedule.place)

      // const vaccine = schedule?.vaccine
      const vaccine = await VaccineService.GetVaccineById(schedule.vaccine_Id)
      if (vaccine) {
        setSelectedVaccine(vaccine)

        // const prevention = preventionDropdownEntries.current.find(vc => vc.id === schedule?.vaccine?.vaccine_Type_Id)
        const prevention = await VaccineTypeService.GetVaccineTypeById(vaccine.vaccine_Type_Id)
        if (prevention) setSelectedPrevention(prevention)
        fetchPreventions(true)

        // if (place) setSelectedPlaceName(place.name)

        setFormValue(prev => {
          return ({
            ...prev,
            prevention: prevention?.vaccine_Type_Name,
            injection_Place_Id: schedule.place_Id,
            injection_Date: (params.increment) ? formatDate(prevResultNextDate) : schedule.start_Date
            // number_Of_Injection: schedule.
          });
        })
      }
    }
  }

  const handleFormReset = async () => {
    setEdited(false)
    setVaccineSelectError(undefined)
    setStartDateError(undefined)
    setEndDateError(undefined)
    setSelectedShedule(undefined)
    if (id) {
      const res = await GetVaccinationResultById(id)
      const fin = res.injection_Number >= res.number_Of_Injection - ((params.increment) ? 1 : 0)
      setFinalInjection(fin)
      setFormValue((params.increment) ? {
        ...res,
        injection_Number: res.injection_Number + 1,
        injection_Date: res.next_Injection_Date,
        isVaccinated: VaccinationResultStatus.NotInjected,
        next_Injection_Date: (fin) ? null : res.next_Injection_Date
      }
        : res)
      setPrevResultNextDate(new Date(res.next_Injection_Date))
      setMinDate(dateOnly(new Date(res.next_Injection_Date)))
      setSelectedPlace(res.injection_Place)
      const vacType = await VaccineTypeService.GetVaccineTypeByName(res.prevention)
      setSelectedPrevention(vacType)
      setSelectedVaccine(res.vaccine)
      setSelectedCustomer(res.customer)
    }
    else console.log("Id not provided")
  };

  const handleSubmitForm = async () => {
    if (validateForm()) {
      try {
        if (params.increment) {
          const latestId = await getLatestResultId() // actually latest id + 1
          await SubmitIncrement({
            ...formValue,
            next_Injection_Date: (finalInjection) ? undefined : formValue.next_Injection_Date,
            id: latestId
          })
          setPopupMessage("Vaccination result created successfully")
          leavingAfterIncrementing.current = true
        }
        else {
          await Submit(formValue)
          setPopupMessage("Vaccination result updated successfully")
        }

        handleFormReset()
        setPopupType(PopupType.alert)
        setPopupDisplay(true)
      }
      catch (err) {
        console.log(err)
      }
    }
  }


  /*
   * Handle form validation
   */
  const [validForm, setValidForm] = useState(false)
  const [customerSelectError, setCustomerSelectError] = useState<string | undefined>(undefined)
  const [preventionSelectError, setPreventionSelectError] = useState<string | undefined>(undefined)
  const [vaccineSelectError, setVaccineSelectError] = useState<string | undefined>(undefined)
  const [injectionError, setInjectionError] = useState<string | undefined>(undefined)
  const [startDateError, setStartDateError] = useState<string | undefined>(undefined)
  const [endDateError, setEndDateError] = useState<string | undefined>(undefined)
  const [scheduleSelectError, setScheduleSelectError] = useState<string | undefined>(undefined)

  const validateForm = () => {
    let valid = true
    if (formValue.customer_Id.length < 1) {
      setCustomerSelectError("Please select a customer.")
      valid = false
    }

    if (!formValue.prevention) {
      setPreventionSelectError("Please select prevention.")
      valid = false
    }

    if (formValue.vaccine_Id.length < 1) {
      setVaccineSelectError("Please select a valid vaccine.")
      valid = false
    }

    if (isNaN(formValue.number_Of_Injection ?? NaN)) {
      setInjectionError("Please enter number of injection.")
      valid = false
    }

    if (params.increment && !selectedShedule) {
      setScheduleSelectError("Please select a schedule.")
      valid = false
    }

    const startDate = new Date(formValue.injection_Date ?? '')
    const validStartDate = startDate instanceof Date && !isNaN(startDate.valueOf())
    if (!validStartDate) {
      setStartDateError("Please select a valid date.")
      valid = false
    }

    const endDate = new Date(formValue.next_Injection_Date ?? '')
    const validEndDate = endDate instanceof Date && !isNaN(endDate.valueOf())
    if (!validEndDate) {
      setEndDateError("Please select a valid date.")
      valid = false
    }

    if (validStartDate && validEndDate) {
      if (startDate > endDate) {
        setStartDateError(message["MSG 14"])
        valid = false
      }

      const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      const diffDays = Math.round(Math.abs((startDate.valueOf() - endDate.valueOf()) / oneDay));
      if (selectedVaccine?.time_Between_Injections && diffDays < selectedVaccine.time_Between_Injections) {
        setStartDateError(`Time between injections must be at least ${selectedVaccine.time_Between_Injections} days.`)
        valid = false
      }
    }

    if (!selectedShedule) {
      setScheduleSelectError("Please select a schedule.")
      valid = false
    }

    setValidForm(valid)
    return valid
  }



  const LoadCustomerObject = () => {
    return (
      <Header as={'h5'} textAlign="center" onClick={fetchCustomers}>
        ...Load more...
      </Header>
    )
  }

  const fetchCustomers = async () => {
    setCustomerDropdownLoading(true)
    const data = await CustomerService.GetCustomersFilter(
      customerDropDownPageIndex.current + 1,
      DROPDOWN_PAGESIZE,
      undefined,
      undefined,
      customerQuery,
    );
    // Handle edge case when system does not have any customers
    if (customerQuery === '' && data.totalItems == 0) {
      setPopupType(PopupType.confirmation)
      setPopupMessage(message["MSG 38"])
      setPopupConfirmAction(() => () => navigate("/customer/create"))
      setNovac(true)
      setPopupDisplay(true)
    }
    // console.log(data)
    customerDropDownPageIndex.current++
    customerDropdownEntries.current = customerDropdownEntries.current.concat(data.customers)
    let newEntries: dropdownEntry[] = customerDropdownEntries.current.filter((customer) => customer.id != defaultCustomer?.id).map((customer) => (
      {
        key: customer.id,
        text: customer.full_Name,
        value: customer.id,
        content: customer.full_Name
      }
    ))
    if (defaultCustomer) {
      newEntries = [{ key: defaultCustomer.id, value: defaultCustomer.id, text: defaultCustomer.full_Name }, ...newEntries]
    }

    if (customerDropDownPageIndex.current < data.totalPages) newEntries.push(
      {
        key: '',
        content: <LoadCustomerObject />,
        disabled: true
      }
    )
    setCustomerDropdownLoading(false)
    setCustomerDropdown(newEntries)
  }

  useEffect(() => {
    setCustomerDropdownLoading(true)
    const timer = setTimeout(() => {
      customerDropDownPageIndex.current = 0
      customerDropdownEntries.current = []
      const wrap = async () => {
        await fetchCustomers()
        setCustomerDropdownLoading(false)
      }
      wrap();
    }, DROPDOWN_FETCHDELAY_MS);
    return () => clearTimeout(timer);
  }, [customerQuery])

  const LoadVaccineObject = (props: { preventionId?: string }) => {
    return (
      <Header as={'h5'} textAlign="center" onClick={() => fetchVaccines(false, (props.preventionId) ? props.preventionId : selectedPrevention?.id)}>
        ...Load more...
      </Header>
    )
  }

  const fetchVaccines = async (initList = false, preventionId?: string) => {
    if (selectedPrevention || preventionId) {
      setVaccineDropdownLoading(true)
      const data = await VaccineService.GetVaccineByVaccineTypeId(
        initList ? 1 : vaccineDropDownPageIndex.current + 1,
        DROPDOWN_PAGESIZE,
        vaccineQuery,
        (preventionId) ? preventionId : selectedPrevention?.id
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
      vaccineDropdownEntries.current = (initList) ? data.vaccines : vaccineDropdownEntries.current.concat(data.vaccines)
      let newEntries: dropdownEntry[] = vaccineDropdownEntries.current.filter((vaccine) => vaccine.id != selectedVaccine?.id).map((vaccine) => (
        {
          key: vaccine.id,
          text: vaccine.vaccine_Name,
          value: vaccine.id,
        }
      ))
      console.log(((preventionId) ? preventionId : selectedPrevention?.id))
      console.log(data)
      if (selectedVaccine && selectedVaccine.vaccine_Type_Id == ((preventionId) ? preventionId : selectedPrevention?.id) && !initList) {
        newEntries = [{ key: formValue.vaccine_Id, value: formValue.vaccine_Id, text: selectedVaccine.vaccine_Name }, ...newEntries]
      }
      console.log(newEntries)

      if (vaccineDropdownEntries.current.length < data.totalVaccines) newEntries.push(
        {
          key: '',
          content: <LoadVaccineObject preventionId={preventionId} />,
          disabled: true
        }
      )
      setVaccineDropdownLoading(false)
      setVaccineDropdown(newEntries)
    }
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
    }, DROPDOWN_FETCHDELAY_MS);
    return () => clearTimeout(timer);
  }, [vaccineQuery])


  /*
   *    Handle fetching vaccine types for the Prevention select drop down (paginated)
   */
  const preventionDropDownPageIndex = useRef(0)
  const preventionDropdownEntries = useRef<VaccineType[]>([])
  const [preventionDropdown, setPreventionDropdown] = useState<dropdownEntry[]>([])
  const [preventionQuery, setPreventionQuery] = useState('')
  const [preventionDropdownLoading, setPreventionDropdownLoading] = useState(false)
  const [selectedPrevention, setSelectedPrevention] = useState<VaccineType>()

  const LoadPreventionObject = () => {
    return (
      <Header as={'h5'} textAlign="center" onClick={() => fetchPreventions()}>
        ...Load more...
      </Header>
    )
  }

  const fetchPreventions = async (initList = false) => {
    setPreventionDropdownLoading(true)
    const apiResponse = await VaccineTypeService.GetPaginatedVaccineTypes((initList) ? 1 : preventionDropDownPageIndex.current + 1, DROPDOWN_PAGESIZE, preventionQuery, true);
    preventionDropDownPageIndex.current = apiResponse.pageIndex
    preventionDropdownEntries.current = (initList) ? apiResponse.items : preventionDropdownEntries.current.concat(apiResponse.items)
    let newEntries: dropdownEntry[] = preventionDropdownEntries.current.filter((prevention) => prevention.vaccine_Type_Name != selectedPrevention?.vaccine_Type_Name).map((prevention) => (
      {
        key: prevention.id,
        text: prevention.vaccine_Type_Name,
        value: prevention.id,
      }
    ))
    if (selectedPrevention) {
      newEntries = [{ key: selectedPrevention.id, value: selectedPrevention.id, text: selectedPrevention.vaccine_Type_Name }, ...newEntries]
    }
    if (apiResponse.pageIndex < apiResponse.totalPages) newEntries.push(
      {
        key: '',
        content: <LoadPreventionObject />,
        disabled: true
      }
    )
    setPreventionDropdownLoading(false)
    setPreventionDropdown(newEntries)
  }

  useEffect(() => {
    setPreventionDropdownLoading(true)
    const timer = setTimeout(() => {
      preventionDropDownPageIndex.current = 0
      preventionDropdownEntries.current = []
      const wrap = async () => {
        await fetchPreventions()
        setPreventionDropdownLoading(false)
      }
      wrap();
    }, DROPDOWN_FETCHDELAY_MS);
    return () => clearTimeout(timer);
  }, [preventionQuery])


  /*
   * Inital render
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

  const firstInjecttion = formValue.injection_Number == 1
  const canBeUpdated = formValue.isVaccinated == VaccinationResultStatus.NotInjected

  useEffect(() => {
    handleFormReset()
  }, [])

  return (
    <>
      <Container>
        <Header as='h2' textAlign="center">{(params.increment) ? "INCREMENT" : "UPDATE"} INJECTION RESULT</Header>
        <Segment>
          <Form onSubmit={handleSubmitForm} warning={!canBeUpdated} error={!validForm}>
            <Message warning>
              Only vaccination results with status "Not injected" can be updated
            </Message>

            <Grid>
              <GridRow>
                <GridColumn width={6}>
                  <Popup
                    disabled={firstInjecttion}
                    trigger={
                      <div>
                        <span>Customer <p className="text-red-500 inline">(*)</p></span>
                        {(!firstInjecttion || params.increment || !canBeUpdated) ?
                          <FormInput
                            value={formValue.customer?.full_Name}
                            placeholder="Select schedule to change place"
                            className="readOnlyInput"
                            readOnly
                          />
                          :
                          <FormSelect
                            options={customerDropdown}
                            placeholder='-Select Customer'
                            lazyLoad
                            name='customer_Id'
                            value={formValue.customer_Id}
                            onChange={(e, v) => { handleSelectCustomer(e, v); setCustomerSelectError(undefined) }}
                            error={customerSelectError}
                            search={() => { return customerDropdown.filter(vac => vac.key != formValue.customer_Id || vac.text?.includes(customerQuery)) }}
                            loading={customerDropdownLoading}
                            onSearchChange={(_, v) => setCustomerQuery(v.searchQuery)}
                            onClose={() => setCustomerQuery('')}
                            disabled={params.increment || !canBeUpdated}
                          />}
                      </div>
                    }>
                    {message["MSG 57"]}
                  </Popup>
                </GridColumn>

                <GridColumn width={5}>
                  <Popup
                    disabled={firstInjecttion}
                    trigger={
                      <div>
                        <span>Prevention <p className="text-red-500 inline">(*)</p></span>
                        {(!firstInjecttion || params.increment || !canBeUpdated) ?
                          <FormInput
                            value={formValue.prevention}
                            placeholder="Select schedule to change place"
                            className="readOnlyInput"
                            readOnly
                          />
                          :
                          <FormSelect
                            options={preventionDropdown}
                            placeholder={(selectedPrevention) ? selectedPrevention.vaccine_Type_Name : '-Select Prevention'}
                            lazyLoad
                            name='prevention'
                            value={(selectedPrevention) ? selectedPrevention.id : ''}
                            onChange={(_, v) => { handleSelectPrevention(v.value as string); }}
                            search={() => { return preventionDropdown.filter(vac => vac.key != selectedPrevention?.id || vac.text?.includes(customerQuery)) }}
                            loading={preventionDropdownLoading}
                            onSearchChange={(_, v) => setPreventionQuery(v.searchQuery)}
                            onClose={() => setCustomerQuery('')}
                            onOpen={() => { if (vaccineDropdownEntries.current.length < 1) fetchVaccines() }}
                            disabled={params.increment || !canBeUpdated}
                            error={preventionSelectError}
                          />}
                      </div>
                    }>
                    {message["MSG 57"]}
                  </Popup>
                </GridColumn>


                <GridColumn width={5}>
                  <Popup
                    disabled={firstInjecttion}
                    trigger={
                      <div>
                        <span>Vaccine <p className="text-red-500 inline">(*)</p></span>
                        {(!firstInjecttion || params.increment || !canBeUpdated) ?
                          <FormInput
                            value={formValue.vaccine?.vaccine_Name}
                            placeholder="Select schedule to change place"
                            className="readOnlyInput"
                            readOnly
                          />
                          :
                          <FormSelect
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
                            disabled={params.increment || !canBeUpdated}
                          />}
                      </div>
                    }>
                    {message["MSG 57"]}
                  </Popup>
                </GridColumn>
              </GridRow>

              <GridRow>
                <GridColumn width={6}>
                  <div>Place <p className="text-red-500 inline">(*)</p></div>
                  <div style={{ display: "flex" }}>
                    <div style={{ flexGrow: 1 }}>

                      <Popup
                        disabled={firstInjecttion}
                        trigger={
                          <div>
                            <FormInput
                              value={selectedPlace?.name}
                              placeholder="Select schedule to change place"
                              className="readOnlyInput"
                              readOnly
                            />
                          </div>
                        }>
                        {message["MSG 57"]}
                      </Popup>
                    </div>
                  </div>
                </GridColumn>

                <GridColumn width={5}>
                  <Popup
                    disabled={firstInjecttion}
                    trigger={
                      <div>
                        <FormInput
                          label={<span>Number of injections <p className="text-red-500 inline">(*)</p></span>}
                          value={formValue.number_Of_Injection}
                          name='number_Of_Injection'
                          onChange={(e) => { handleChange(e); setStartDateError(undefined) }}
                          type="number"
                          readOnly={!firstInjecttion || params.increment || !canBeUpdated}
                          className={(!firstInjecttion || params.increment || !canBeUpdated) ? "readOnlyInput" : ""}
                          error={injectionError}
                        />
                      </div>
                    }>
                    {message["MSG 57"]}
                  </Popup>
                </GridColumn>

                <GridColumn width={5}>
                  <FormInput
                    label={<span>Injection No. <p className="text-red-500 inline">(*)</p></span>}
                    value={formValue.injection_Number}
                    name='injection_Number'
                    onChange={(e) => { handleChange(e); setStartDateError(undefined) }}
                    type="number"
                    readOnly
                    className={"readOnlyInput"}
                    error={injectionError}
                  />
                </GridColumn>
              </GridRow>

              <GridRow>
                <GridColumn width={6} stretched>
                  <Popup
                    disabled={!!selectedShedule || !canBeUpdated}
                    trigger={
                      <div className="full-width-input">
                        <div>Date of injection <p className="text-red-500 inline">(*)</p></div>
                        {selectedShedule ?
                          <Datepicker
                            name='injection_Date'
                            onChange={handleSelectInjectionDate}
                            error={startDateError}
                            minDate={minDate}
                            maxDate={maxDate}
                            // maxDate={new Date(selectedVaccine?.time_End_Next_Injection.toString() ?? '')} // Today
                            value={(formValue.injection_Date) ? new Date(formValue.injection_Date?.toString()) : undefined}
                            placeholder={"Select appointment date"}
                            format="DD/MM/YYYY"
                          />
                          :
                          <Datepicker
                            placeholder={"Select a schedule to change date"}
                            className="readOnlyInput"
                            value={(formValue.injection_Date) ? (params.increment) ? null : new Date(formValue.injection_Date?.toString()) : null}
                            error={startDateError}
                            format="DD/MM/YYYY"
                            clearable={false}
                            readOnly
                          />
                        }
                      </div>
                    }>
                    Please select a schedule before editing this field
                  </Popup>
                  {startDateError &&
                    <Label basic color='red' pointing> {startDateError} </Label>
                  }
                </GridColumn>

                <GridColumn width={5} stretched>
                  <Popup
                    disabled={!!selectedShedule || !canBeUpdated}
                    trigger={
                      <div className="full-width-input">
                        <span>Next injection appointment <p className="text-red-500 inline">(*)</p></span>
                        {selectedShedule ?
                          <Datepicker
                            name='next_Injection_Date'
                            onChange={handleSelectNextInjectionDate}
                            error={endDateError}
                            minDate={minNextDate}
                            value={(formValue.next_Injection_Date) ? new Date(formValue.next_Injection_Date?.toString()) : undefined}
                            placeholder={"Select next appointment date"}
                            format="DD/MM/YYYY"
                          />
                          :
                          <Datepicker
                            placeholder={"Select a schedule to change date"}
                            className="readOnlyInput"
                            value={(formValue.next_Injection_Date) ? (params.increment) ? null : new Date(formValue.next_Injection_Date?.toString()) : null}
                            error={endDateError}
                            format="DD/MM/YYYY"
                            clearable={false}
                            readOnly
                          />
                        }
                      </div>
                    }>
                    Please select a schedule before editing this field
                  </Popup>
                  {endDateError &&
                    <Label basic color='red' pointing> {endDateError} </Label>
                  }
                </GridColumn>
              </GridRow>

              {canBeUpdated &&
                <Card fluid style={{ margin: "1em" }}>
                  <CardContent>
                    <CardHeader>Select Schedule {params.increment && <p className="text-red-500 inline">(*)</p>}</CardHeader>
                  </CardContent>
                  <CardContent>
                    <Table singleLined basic={"very"} style={{ borderRadius: 0 }} selectable>
                      <TableHeader style={{ backgroundColor: "#43a047" }}>
                        <TableRow style={{ color: "white" }}>
                          <TableHeaderCell style={headerStyle}>Vaccine</TableHeaderCell>
                          <TableHeaderCell style={headerStyle}>Time</TableHeaderCell>
                          <TableHeaderCell style={headerStyle}>Place</TableHeaderCell>
                          <TableHeaderCell style={headerStyle}>Status</TableHeaderCell>
                          <TableHeaderCell style={headerStyle}>Note</TableHeaderCell>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {
                          listOrDefault(scheduleList?.list.map(
                            (schedule) =>
                              <TableRow className="cursor-pointer" onClick={() => handleSelectSchedule(schedule.id)} active={selectedShedule?.id == schedule.id}>
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
                    <div className="flex justify-end">
                      <div></div>
                      <div>
                        <Pagination
                          defaultActivePage={1}
                          size='small'
                          floated="right"
                          totalPages={scheduleList.totalPages}
                          onPageChange={(_, p) => handlePageChange(p.activePage as number)}
                        />
                      </div>
                    </div>

                    <Message error>{scheduleSelectError}</Message>

                  </CardContent>
                </Card>
              }

              <GridRow>
                <Container className="p-2">
                  <FormButton color='green' style={{ marginLeft: "3px" }} disabled={(!edited && !params.increment) || !canBeUpdated} inline>{"Save"}</FormButton>
                  <FormButton color='blue' style={{ marginLeft: "3px" }} inline type="button"
                    onClick={() => changeGuard(!edited, handleFormReset, message["MSG 44"])}
                  >
                    Reset
                  </FormButton>
                  <FormButton color='orange' style={{ marginLeft: "3px" }} inline type="button"
                    onClick={() => changeGuard(!edited, () => navigate('/vaccinationResult'), message["MSG 48"])}
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
                  onClick={() => {
                    if (leavingAfterIncrementing.current) navigate("/vaccinationResult")
                    setPopupDisplay(false)
                  }}
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
                      if (novac) navigate("/vaccinationResult")
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

export default UpdateVaccinationResult
