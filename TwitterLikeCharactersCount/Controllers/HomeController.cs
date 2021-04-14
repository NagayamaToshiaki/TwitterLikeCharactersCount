using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TwitterLikeCharactersCount.Models;

namespace TwitterLikeCharactersCount.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Input()
        {
            return View(new CharacterCountModel());
        }

        [HttpPost]
        public ActionResult Input(CharacterCountModel model)
        {
            ModelState.Clear();
            if (!TryValidateModel(model))
            {
                return View(model);
            }
            return RedirectToAction(nameof(Result), new { input = model.InputToCount });
        }

        public ActionResult Result(string input)
        {
            ViewBag.Message = input;
            return View();
        }
    }
}