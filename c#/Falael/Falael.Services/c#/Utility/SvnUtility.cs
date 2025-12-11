using System.Net;

using SharpSvn;

namespace Falael.Services
{
    public static class SvnUtility
	{
		const string SVN_URL = "svn://daniel@svn.falael.com:8443/Falael.DATA/Falael.Auto.Mon/";
		const string SVN_URL_DEBUG = "svn://daniel@svn.falael.com:8443/Falael.DATA/Falael.Auto.Mon.Debug/";
		const string SVN_USERNAME = "daniel";
		const string SVN_PASSWORD = "";     //	use the sysem-cached svn password
		const string SVN_COMMIT_MESSAGE = "Automatic backup commit";

		public static bool IsSvnDirectory(string fullPath)
		{
			using SvnClient client = new();

			client.Authentication.DefaultCredentials = new NetworkCredential(SVN_USERNAME, SVN_PASSWORD);
			try
			{
				if (!client.GetInfo(SvnPathTarget.FromString(fullPath), out SvnInfoEventArgs info)) return false;
				if (!client.CleanUp(fullPath)) throw new SvnClientException($"Failed to clean up and release locks at \"{fullPath}\".");
				string fullRepoPath = info.Uri.ToString();
				return fullRepoPath.StartsWith(SVN_URL, StringComparison.OrdinalIgnoreCase) || fullRepoPath.StartsWith(SVN_URL_DEBUG, StringComparison.OrdinalIgnoreCase);
			}
			catch (SharpSvn.SvnWorkingCopyPathNotFoundException)                                                    //	it's under an SVN working directory but not versioned
			{
				Uri svnUrlUri = new(SVN_URL);
				string svnPath = svnUrlUri.AbsolutePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);   //	will produce @"Falael.DATA\Falael.Auto.Mon\"
				return fullPath.Contains(svnPath, StringComparison.OrdinalIgnoreCase);
			}
		}

		public static bool Update(string fullPath)
		{
			using SvnClient client = new();

			client.Authentication.DefaultCredentials = new NetworkCredential(SVN_USERNAME, SVN_PASSWORD);

			if (!client.GetInfo(SvnPathTarget.FromString(fullPath), out SvnInfoEventArgs info)) throw new SvnClientException($"Not a working copy: \"{fullPath}\".");

			SvnUpdateArgs args = new();
			args.Conflict += (sender, e) =>
			{
				e.Choice = SvnAccept.Postpone;
				throw new SvnClientException($"Conflict occurred during update at '{e.Path}'.");
			};

			return client.Update(info.WorkingCopyRoot, args);
		}

		public static bool CommitAllChanges(string fullPath)
		{
			using SvnClient client = new();

			client.Authentication.DefaultCredentials = new NetworkCredential(SVN_USERNAME, SVN_PASSWORD);

			client.Add(fullPath, new SvnAddArgs() { AddParents = true, Force = true });

			if (!client.GetInfo(SvnPathTarget.FromString(fullPath), out SvnInfoEventArgs info)) throw new SvnClientException($"Not a working copy: \"{fullPath}\".");

			List<string> stagedPaths = [];
			List<string> deletedPaths = [];
			SvnStatusArgs statusArgs = new() { Depth = SvnDepth.Infinity };
			client.Status(info.WorkingCopyRoot, statusArgs, (sender, e) =>
			{
				if (e.FullPath.StartsWith(fullPath, StringComparison.OrdinalIgnoreCase))
				{
					if (e.LocalNodeStatus == SvnStatus.Missing) deletedPaths.Add(e.FullPath);
					stagedPaths.Add(e.FullPath);
				}
				else if (fullPath.StartsWith(e.FullPath, StringComparison.OrdinalIgnoreCase)) stagedPaths.Add(e.FullPath);
			});
			deletedPaths.ForEach(v => client.Delete(v));
			if (stagedPaths.Count == 0) return false;

			SvnCommitArgs commitArgs = new() { LogMessage = SVN_COMMIT_MESSAGE, };
			return client.Commit(stagedPaths, commitArgs);
		}
	}
}
