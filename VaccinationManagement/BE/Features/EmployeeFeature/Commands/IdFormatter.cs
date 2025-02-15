namespace VaccinationManagement.Features.EmployeeFeature.Commands
{
    public class IdFormatter
    {
        public string NewId(string id)
        {
            string s = id.Substring(2);
            while (s[0] == '0')
            {
                s = s.Remove(0, 1);
            }
            int num = int.Parse(s) + 1;
            string rs = num.ToString();
            while (rs.Length < 6)
            {
                rs = "0" + rs;
            }
            return "EM" + rs;
        }
    }
}
