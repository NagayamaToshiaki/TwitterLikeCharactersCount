using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Html;

namespace TwitterLikeCharactersCount.Helpers
{
    public static class CharactersCountingDivHelper
    {
        /// <summary>
        /// 文字数を計測可能で、内容を自由に編集可能なdiv要素を生成します。
        /// </summary>
        /// <typeparam name="TModel">モデルの型。</typeparam>
        /// <typeparam name="TProperty">プロパティの型。</typeparam>
        /// <param name="helper">ヘルパー。</param>
        /// <param name="expression">プロパティを表す式。</param>
        /// <param name="maxLength">入力欄の最大文字数。半角基準で入力してください。</param>
        /// <param name="wrapperHtmlAttributes">ラッパーのHTMLプロパティ。idは指定しても無視されます。</param>
        /// <param name="editorHtmlAttributes">編集箇所のHTMLプロパティ。id、controleditableは指定しても無視されます。</param>
        /// <param name="validationHtmlAttributes">編集箇所のHTMLプロパティ。</param>
        /// <param name="excessiveStringAttributes">超過部分のHTMLプロパティ。</param>
        /// <returns></returns>
        public static IHtmlString TwitterLikeInputFor<TModel, TProperty>(this HtmlHelper<TModel> helper, Expression<Func<TModel, TProperty>> expression, int maxLength = 280, Dictionary<string, object> wrapperHtmlAttributes = null, Dictionary<string, object> editorHtmlAttributes = null, Dictionary<string, object> validationHtmlAttributes = null, Dictionary<string, object> excessiveStringAttributes = null)
        {
            wrapperHtmlAttributes = wrapperHtmlAttributes ?? new Dictionary<string, object>();
            editorHtmlAttributes = editorHtmlAttributes ?? new Dictionary<string, object>();
            validationHtmlAttributes = validationHtmlAttributes ?? new Dictionary<string, object>();
            excessiveStringAttributes = excessiveStringAttributes ?? new Dictionary<string, object>();

            var propertyId = helper.IdFor(expression);

            var length = maxLength / 2;

            wrapperHtmlAttributes["id"] = $"{propertyId}_wrapper";
            var wrapperStart = GenerateElement(htmlAttributes: wrapperHtmlAttributes, mode: TagRenderMode.StartTag);

            var hidden = helper.HiddenFor(expression);

            editorHtmlAttributes["id"] = $"{propertyId}_editor";
            editorHtmlAttributes["class"] = $"{editorHtmlAttributes["class"].ToString()} editor";
            editorHtmlAttributes["contenteditable"] = "true";
            editorHtmlAttributes["data-max-length"] = maxLength;
            var editor = GenerateElement(htmlAttributes: editorHtmlAttributes);

            var counterParagraphStart = GenerateElement("p", mode: TagRenderMode.StartTag);
            var counterDictionary = new Dictionary<string, object>();
            counterDictionary.Add("id", $"{propertyId}_counter");
            var counterSpanStart = GenerateElement("span", counterDictionary, TagRenderMode.StartTag);
            var counterSpanEnd = GenerateElement("span", mode: TagRenderMode.EndTag);
            var counterParagraphEnd = GenerateElement("p", mode: TagRenderMode.EndTag);
            var counterUnit = "文字";
            var counter = $"{counterParagraphStart}{counterSpanStart}0{counterSpanEnd}/{length} {counterUnit}{counterParagraphEnd}";

            var validationMessage = helper.ValidationMessageFor(expression, "", validationHtmlAttributes);

            var templateDictionary = new Dictionary<string, object>();
            templateDictionary.Add("id", $"{propertyId}_template");
            var templateStart = GenerateElement("template", templateDictionary, TagRenderMode.StartTag);
            var templateInner = GenerateElement("span", excessiveStringAttributes);
            var templateEnd = GenerateElement("template", mode: TagRenderMode.EndTag);
            var template = $"{templateStart}{templateInner}{templateEnd}";

            var wrapperEnd = GenerateElement(mode: TagRenderMode.EndTag);

            var innerHtml = $"{wrapperStart}{hidden}{editor}{counter}{validationMessage}{template}{wrapperEnd}";

            return MvcHtmlString.Create(innerHtml);
        }

        /// <summary>
        /// HTML要素を生成します。
        /// </summary>
        /// <param name="tagName">要素のタグ名。</param>
        /// <param name="htmlAttributes">要素のHTML属性。</param>
        /// <param name="mode">タグの生成モード。</param>
        private static string GenerateElement(string tagName = "div", Dictionary<string, object> htmlAttributes = null, TagRenderMode mode = TagRenderMode.Normal)
        {
            var tag = new TagBuilder(tagName);
            tag.MergeAttributes(htmlAttributes);
            return tag.ToString(mode);
        }
    }
}
