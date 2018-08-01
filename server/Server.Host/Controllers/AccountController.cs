﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NLog;
using Server.Host.Models;
using Server.Shared.Core;
using Server.Shared.Models;

namespace Server.Host.Controllers
{
    [Authorize]
    public class AccountController : Controller
    {
        private readonly IAccountManager<User> _manager;
        private static readonly ILogger Log = LogManager.GetCurrentClassLogger();

        public AccountController(IAccountManager<User> manager)
        {
            _manager = manager;
        }

        /// <summary>
        /// 登陆
        /// </summary>
        /// <param name="uid"></param>
        /// <param name="pwd"></param>
        /// <returns></returns>
        [HttpPost]
        [AllowAnonymous]
        public ActionResult Login(string uid, string pwd)
        {
            var (code, jwt) = _manager.Login(uid, pwd);
            Log.Info($"{Request.Path} uid=[{uid}] pwd=[***] =>code=[{code}]");
            return Ok(new { code, jwt });
        }

        /// <summary>
        /// 注册
        /// </summary>
        /// <param name="m"></param>
        /// <returns></returns>
        [HttpPost]
        [AllowAnonymous]
        public ActionResult Register(UserModel m)
        {
            var (code, jwt) = _manager.Register(
                uid: m.Uid,
                name: m.Name,
                pwd: m.Pwd,
                phone: m.Phone,
                email: m.Email);
            Log.Info($"{Request.Path} uid=[{m.Uid}] name=[{m.Name}]... =>code=[{code}]");

            return Ok(new { code, jwt });
        }

        /// <summary>
        /// 修改信息
        /// </summary>
        /// <param name="name"></param>
        /// <param name="phone"></param>
        /// <param name="email"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult UpdateInfo(string name, string phone, string email)
        {
            var code = _manager.UpdateUserInfo(name, phone, email);
            Log.Info($"{Request.Path} name=[{name}] phone=[{phone}] email=[{email}] =>code=[{code}]");
            return Ok(new { code });
        }

        /// <summary>
        /// 修改密码
        /// </summary>
        /// <param name="oldPwd"></param>
        /// <param name="newPwd"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult UpdatePwd(string oldPwd, string newPwd)
        {
            var code = _manager.UpdateUserPwd(oldPwd, newPwd);
            Log.Info($"{Request.Path} oldPwd=[{oldPwd}] newPwd=[{newPwd}] =>code=[{code}]");
            return Ok(new { code });
        }

        [HttpPost]
        public ActionResult Validate()
        {
            if (_manager.User == null)
                return Unauthorized();
            Log.Info($"{Request.Path} => uid=[{_manager.User.Id}] ...");
            return Ok(new
            {
                uid = _manager.User.Uid,
                name = _manager.User.Name,
                phone = _manager.User.Phone,
                email = _manager.User.Email,
                role = _manager.User.Role
            });
        }
    }
}
