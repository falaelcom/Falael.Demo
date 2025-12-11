if (isOriginalLocale)
{
	const paths = fs.readdirSync(trackPath, { recursive: true, withFileTypes: true })
		.filter(dirent => dirent.isFile() && dirent.name.endsWith('.catalog.txt'))
		.map(dirent => path.join(trackPath, dirent.name));  // <-- use path.join instead of path.resolve
	paths.forEach(p =>
	{
		const destFileName = p.replace("catalog.txt", "original-locale.txt");
		fs.writeFileSync(destFileName, localePrefix);
		etp.artifactCache_touchArtifact(etp_artifactCacheContext, { cachePath: destFileName });
	});
}
