using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(TwitterLikeCharactersCount.Startup))]
namespace TwitterLikeCharactersCount
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
