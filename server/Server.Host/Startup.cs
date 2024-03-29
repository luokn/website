﻿using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using NLog.Web;
using Server.Host.Middlewares.IPLock;
using Server.Service.Extension;
using System;

namespace Server.Host
{
    public class Startup
    {
        private IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
            services.AddRedis(opt =>
                {
                    opt.RedisConnection = "localhost";
                    opt.IPDataBase = 1;
                    opt.JwtDataBase = 2;
                })
                .AddIPLocker(opt =>
                {
                    opt.MaxVisitsTimes = 120;
                    opt.LockedTime = TimeSpan.FromMinutes(5);
                    opt.LimitTime = TimeSpan.FromMinutes(1);
                });
            services.AddWhutService();
            services.AddAppDbContext()
                .AddLiteDb(opt => { opt.DbPath = Configuration["DbOptions:DbPath"]; });
            services.AddJwtAuth(opt =>
            {
                opt.Key = Configuration["AuthOptions:Key"];
                opt.Audience = Configuration["AuthOptions:Audience"];
                opt.Issuer = Configuration["AuthOptions:Audience"];
                opt.UidRegex = Configuration["AuthOptions:UidRegex"];
                opt.PwdRegex = Configuration["AuthOptions:PwdRegex"];
                opt.UidClaimType = Configuration["AuthOptions:UidClaimType"];
                opt.Expires = TimeSpan.FromDays(30);
            });
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory log)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            log.AddNLog();
            env.ConfigureNLog("Nlog.config");
            app.UseIPLocker();
            app.UseAuthentication();
            app.UseMvc(routes => { routes.MapRoute("api", "/api/{controller}/{action}/{uid?}"); });
        }
    }
}
