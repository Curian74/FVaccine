using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using VaccinationManagement.Data;
using VaccinationManagement.Features.EmployeeFeature.Queries;
using VaccinationManagement.Features.MenuFeature.Queries;
using VaccinationManagement.Features.MenuFeature.Commands;
using VaccinationManagement.Models;
using VaccinationManagement.Models.DTOs;

namespace VaccinationManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenusController : Controller
    {
        private readonly IMediator _mediator;

        public MenusController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/Menus
        /// API Get list Menus
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Menu>>> GetMenus([FromQuery] bool? Status)
        {
            return Ok(await _mediator.Send(new GetMenus { Status = Status }));
        }

        // GET: api/Menus/id
        /// API Get sub menu
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<Menu>>> GetSubMenu(string id, bool? Status)
        {
            var query = new GetSubMenus { Id = id, Status = Status };
            var subs = await _mediator.Send(query);
            var list = subs.ToList();

            if (list == null)
            {
                return NotFound();
            }

            return Ok(list);
        }

        [HttpGet("latest")]
        public async Task<ActionResult<Menu>> GetLastMenu()
        {
            var menu = await _mediator.Send(new GetLastMenu());

            if (menu == null)
            {
                return NotFound();
            }

            return menu;
        }

        [HttpGet("paged")]
        public async Task<ActionResult<IEnumerable<Menu>>> GetMenusPaged([FromQuery] QueryMenuDTO query, string? SearchQuery)
        {
            var menus = new GetMenuWithPaginationQuery { query = query, SearchQuery = SearchQuery };
            var list = await _mediator.Send(menus);

            if (list == null)
            {
                return NotFound();
            }

            return Ok(list);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateMenu([FromBody] UpdateMenuQuery menu)
        {
            var result = await _mediator.Send(menu);
            if (result.Result is ConflictResult)
            {
                return Conflict();
            }
            if (result.Result is NotFoundResult)
            {
                return NotFound();
            }

            return CreatedAtAction("GetMenus", new { id = menu.Id }, menu);
        }


        [HttpPut("auths")]
        public async Task<IActionResult> UpdateMenuAuthorizations([FromBody] UpdateMenuAuthorizationsQuery request)
        {
            var result = await _mediator.Send(request);
            if (result.Result is ConflictResult)
            {
                return Conflict();
            }
            if (result.Result is NotFoundResult)
            {
                return NotFound();
            }

            return CreatedAtAction("GetMenus", new { id = request.Id }, request);
        }

        [HttpPost]
        public async Task<ActionResult<Menu>> PostMenu([FromBody] CreateMenuQuery menu)
        {
            var result = await _mediator.Send(menu);
            if (result.Result is ConflictResult)
            {
                return Conflict();
            }
            return CreatedAtAction("GetMenus", new { id = menu.Id }, menu);
        }

        /*

        // GET: Menus
        public async Task<IActionResult> Index()
        {
            return View(await _context.Menus.ToListAsync());
        }

        // GET: Menus/Details/5
        public async Task<IActionResult> Details(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var menu = await _context.Menus
                .FirstOrDefaultAsync(m => m.Id == id);
            if (menu == null)
            {
                return NotFound();
            }

            return View(menu);
        }

        // GET: Menus/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Menus/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Name,Path,Icon,ParentID,Id")] Menu menu)
        {
            if (ModelState.IsValid)
            {
                menu.Id = Guid.NewGuid();
                _context.Add(menu);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(menu);
        }

        // GET: Menus/Edit/5
        public async Task<IActionResult> Edit(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var menu = await _context.Menus.FindAsync(id);
            if (menu == null)
            {
                return NotFound();
            }
            return View(menu);
        }

        // POST: Menus/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, [Bind("Name,Path,Icon,ParentID,Id")] Menu menu)
        {
            if (id != menu.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(menu);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!MenuExists(menu.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            return View(menu);
        }

        // GET: Menus/Delete/5
        public async Task<IActionResult> Delete(Guid? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var menu = await _context.Menus
                .FirstOrDefaultAsync(m => m.Id == id);
            if (menu == null)
            {
                return NotFound();
            }

            return View(menu);
        }

        // POST: Menus/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(Guid id)
        {
            var menu = await _context.Menus.FindAsync(id);
            if (menu != null)
            {
                _context.Menus.Remove(menu);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool MenuExists(Guid id)
        {
            return _context.Menus.Any(e => e.Id == id);
        }

        */
    }
}
