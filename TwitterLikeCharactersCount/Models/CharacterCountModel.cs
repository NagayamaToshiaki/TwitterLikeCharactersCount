using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace TwitterLikeCharactersCount.Models
{
    public class CharacterCountModel
    {
        [DisplayName("入力")]
        [Required]
        public string InputToCount { get; set; }
    }
}