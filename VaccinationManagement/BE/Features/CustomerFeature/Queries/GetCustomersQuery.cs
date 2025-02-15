using MediatR;
using VaccinationManagement.Models;
using System.Collections.Generic;

namespace VaccinationManagement.Features.CustomerFeature.Queries
{
    public class GetCustomersQuery : IRequest<CustomerListResult>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 5;
        public string? SearchTerm { get; set; }
        public bool IsActive { get; set; }
    }

    public class CustomerListResult
    {
        public List<Customer> Customers { get; set; }
        public int TotalCustomers { get; set; }
    }
}
