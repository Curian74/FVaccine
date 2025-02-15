import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Typography,
  Button,
  CardBody,
  CardFooter,
  IconButton,
  Input,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { Schedule } from "@/types/schedule";
import { AxiosError } from "axios";
import ScheduleService from "@/services/ScheduleService";

const TABLE_HEAD = ["Center", "Start Date", "End Date", "Required Doses", "Minimum Interval", "Description"];


const PAGE_SIZE = 10;

type ScheduleListComponentProps = {
  vaccineId: string
  onTableClick: (data: Schedule) => void
}

const ScheduleListComponent = ({ vaccineId, onTableClick }: ScheduleListComponentProps) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {

      try {
        const data = await ScheduleService.GetScheduleByVaccineId(vaccineId, pageIndex, PAGE_SIZE, searchTerm);
        setSchedules(data.items);
        setTotalPage(data.totalPages);
      } catch (e) {
        const error = e as AxiosError;
        console.log(error);
      }
    }
    fetchSchedule();
  }, [vaccineId, pageIndex, searchTerm])

  const handlePageChange = (pageIndex: number) => {
    setPageIndex(pageIndex);
  }

  return (
    <Card
      placeholder=""
      onPointerEnterCapture={() => { }}
      onPointerLeaveCapture={() => { }}
      className="h-full w-full">
      <CardHeader
        placeholder=""
        onPointerEnterCapture={() => { }}
        onPointerLeaveCapture={() => { }}
        floated={false} shadow={false} className="rounded-none">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography
              placeholder=""
              onPointerEnterCapture={() => { }}
              onPointerLeaveCapture={() => { }}
              variant="h5" color="blue-gray">
              Schedule is open
            </Typography>
            <Typography
              placeholder=""
              onPointerEnterCapture={() => { }}
              onPointerLeaveCapture={() => { }}
              className="mt-1 font-normal text-red-700">
              Please select a schedule in table below to complete register
            </Typography>
          </div>
          <div className="flex w-full shrink-0 gap-2 md:w-max">
            <div className="w-full md:w-72">
              <Input
                crossOrigin={undefined}
                placeholder=""
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody
        placeholder=""
        onPointerEnterCapture={() => { }}
        onPointerLeaveCapture={() => { }}
        className="overflow-scroll px-0">

        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    placeholder=""
                    onPointerEnterCapture={() => { }}
                    onPointerLeaveCapture={() => { }}
                    variant="small"
                    color="blue-gray"
                    className="font-bold text-black leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedules.map(
              (
                schedule,
                index
              ) => {
                const isLast = index === schedules.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={schedule.id}
                    onClick={() => onTableClick(schedule)}
                    className="cursor-pointer"
                  >
                    <td className={classes}>
                      <div className="flex items-center gap-3 ">
                        <Typography
                          placeholder=""
                          onPointerEnterCapture={() => { }}
                          onPointerLeaveCapture={() => { }}
                          variant="small"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {schedule.place?.name}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography
                        placeholder=""
                        onPointerEnterCapture={() => { }}
                        onPointerLeaveCapture={() => { }}
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {schedule.start_Date}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        placeholder=""
                        onPointerEnterCapture={() => { }}
                        onPointerLeaveCapture={() => { }}
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {schedule.end_Date}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        placeholder=""
                        onPointerEnterCapture={() => { }}
                        onPointerLeaveCapture={() => { }}
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {(schedule.vaccine?.required_Injections || 1) < 100 ? schedule.vaccine?.required_Injections : "Yearly"}
                        {schedule.vaccine?.required_Injections != 1 ? " Injections" : " Injection"}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        placeholder=""
                        onPointerEnterCapture={() => { }}
                        onPointerLeaveCapture={() => { }}
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {schedule.vaccine?.time_Between_Injections} days
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        placeholder=""
                        onPointerEnterCapture={() => { }}
                        onPointerLeaveCapture={() => { }}
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {schedule.description}
                      </Typography>
                    </td>


                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </CardBody>
      <CardFooter
        placeholder=""
        onPointerEnterCapture={() => { }}
        onPointerLeaveCapture={() => { }}
        className="flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Button
          placeholder=""
          onPointerEnterCapture={() => { }}
          onPointerLeaveCapture={() => { }}
          variant="outlined" size="sm"
          disabled={pageIndex == 1}
          onClick={() => {
            const newIndex = pageIndex - 1;
            setPageIndex(newIndex)
          }}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPage }, (_, index) => index + 1).map((page) => (
            <IconButton
              placeholder=""
              onPointerEnterCapture={() => { }}
              onPointerLeaveCapture={() => { }}
              variant="outlined" size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </IconButton>
          ))}

        </div>
        <Button
          placeholder=""
          onPointerEnterCapture={() => { }}
          onPointerLeaveCapture={() => { }}
          variant="outlined" size="sm"
          disabled={pageIndex == totalPage}
          onClick={() => {
            const newIndex = pageIndex + 1;
            setPageIndex(newIndex)
          }}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ScheduleListComponent;