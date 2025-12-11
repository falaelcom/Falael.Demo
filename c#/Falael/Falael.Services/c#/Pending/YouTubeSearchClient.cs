using Google.Apis.Services;
using Google.Apis.YouTube.v3;



namespace Falael.Services
{
	public class YouTubeSearchClient
	{
		public YouTubeSearchClient(string apiKey, string applicationName)
		{
			this.apiKey = apiKey;
			this.applicationName = applicationName;
		}

		public async Task<string?> Search(string query)
		{
			var youtubeService = new YouTubeService(new BaseClientService.Initializer()
			{
				ApiKey = this.apiKey,
				ApplicationName = this.applicationName
			});

			var searchRequest = youtubeService.Search.List("snippet");
			searchRequest.Q = query;
			searchRequest.MaxResults = 1;

			var searchResponse = await searchRequest.ExecuteAsync();
			if (searchResponse.Items.Count > 0) return searchResponse.Items[0].Id.VideoId;
			return null;
		}

		readonly string apiKey;
		readonly string applicationName;
	}
}
