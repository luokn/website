﻿using System;

namespace Server.Shared.Models.Whut
{
    public class EotInfo
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsEvaluate { get; set; }
        public string EotLink { get; set; }
    }
}