using System;
using System.IO;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

using Falael.ExtensionMethods;

using LiberLudens.Gamebook.Builder.Book;

namespace LiberLudens.Gamebook.Builder.Build
{
	public partial class BuildUserControl : UserControl
	{
		static string ConfigurationFileName = "build.config";

		public BuildUserControl()
		{
			InitializeComponent();

			try
			{
				Falael.Parsers.ParserGenerator1_0.ParserGeneratorDocument<ulong>.Test();
				//Falael.UnitTests.Run();
			}
			catch (Exception ex)
			{
				System.Diagnostics.Debug.WriteLine(ex.ToString());
			}

			try
			{
				Settings.Load(ConfigurationFileName);
			}
			catch (Exception ex)
			{
				this.Log("WARNING", "Settings file not found, creating a new one.");
				this.Log(ex);

				try
				{
					Settings.Create(ConfigurationFileName);
				}
				catch (Exception ex2)
				{
					this.Log("ERROR", "Could not create a new settings file.");
					this.Log(ex2);
				}
			}

			this.booksRootPathTextBox.Text = Settings.BooksRootPath;
		}

		#region Infrastructure

		string[] ReadBookIds(string booksRootPath)
		{
			List<string> result = new List<string>();

			var currentDirectory = Directory.GetCurrentDirectory();
			var fullDirectoryPath = Path.Combine(currentDirectory, booksRootPath);

			if (!Directory.Exists(fullDirectoryPath))
			{
				this.Log("ERROR", string.Format("Directory not found: {0}", fullDirectoryPath));
				return result.ToArray();
			}

			string[] directories = Directory.GetDirectories(booksRootPath);
			for (int length = directories.Length, i = 0; i < length; ++i)
			{
				result.Add(Path.GetFileName(directories[i]));
			}

			return result.ToArray();
		}

		void UpdateBookList()
		{
			var bookIds = this.ReadBookIds(this.booksRootPathTextBox.Text);

			if (!this.bookCheckedListBox.Items.Cast<string>().SetEquals(bookIds, StringComparer.CurrentCultureIgnoreCase))
			{
				HashSet<string> selectedBooks = new HashSet<string>(this.bookCheckedListBox.CheckedItems.Cast<string>());
				this.bookCheckedListBox.Items.Clear();
				for (int length = bookIds.Length, i = 0; i < length; ++i)
				{
					var item = bookIds[i];
					this.bookCheckedListBox.Items.Add(item, selectedBooks.Contains(item));
				}
			}

			++this.uiEventsSuspendCount;
			try
			{
				if (!this.bookCheckedListBox.CheckedItems.Cast<string>().SetEquals(Settings.SelectedBooks, StringComparer.CurrentCultureIgnoreCase))
				{
					foreach (int i in bookCheckedListBox.CheckedIndices)
					{
						bookCheckedListBox.SetItemCheckState(i, CheckState.Unchecked);
					}
					for (int length = Settings.SelectedBooks.Length, i = 0; i < length; ++i)
					{
						var item = Settings.SelectedBooks[i];
						this.bookCheckedListBox.SetItemChecked(this.bookCheckedListBox.FindStringExact(item), true);
					}
				}
			}
			finally
			{
				--this.uiEventsSuspendCount;
			}
		}

		void BuildBook(string bookId)
		{
			var bookFullPath = Path.Combine(this.booksRootPathTextBox.Text, bookId);
			if (!Directory.Exists(bookFullPath))
			{
				throw new Exception(string.Format("Book directory not found: \"{0}\"", bookFullPath));
			}
			var bookDocument = new BookDocument<ulong>();
			bookDocument.LoadDirectory(bookFullPath, (pass, progress, maxProgress, text) =>
			{
				var step = Math.Ceiling(maxProgress / 10d);
				if(progress % step == 0 || progress == maxProgress)
				{
					var percentage = Math.Round(progress * 100d / maxProgress);
					this.Log("INFO", string.Format("<{0}> {1}/{2} {3}%", pass, progress, maxProgress, percentage));
				}
			});

			int i = 0;

			//  TODO: create book processing pipeline
			//
			//  TODO: V load all code files, recursively
			//  TODO:   V engine js
			//	TODO:   V book html
			//	TODO:   V book css
			//	TODO:   V book xhtml
			//	TODO:   V book data json
			//	TODO:		+ index files
			//	TODO:		+ map files
			//	TODO:   V book data txt
			//	TODO:		V resource-*.txt
			//	TODO:		V room-*.txt
			//
			//  TODO: - build references
			//  TODO:	- parse index json files, look for
			//  TODO:		- index json include
			//  TODO:		- map json include
			//  TODO:		- room text include
			//  TODO:	- parse javascript files, look for
			//  TODO:		- javascript include
			//  TODO:		- xhtml include
			//  TODO:		- css include
			//  TODO:	V add to the dom footprints for all non-code resources from the book's "resources" directory
			//
			//	TODO: - create output to a specified directory
			//	TODO: - build a single html page containg all code 
			//	TODO:	- position the resources at the end of the page; let the main html load immediately and show loading progress; update the progress w/ js
			//	TODO: - copy all referenced resources
			//	TODO:	- experiment with inline base64 encoded images directly in css and html: https://www.stevefenton.co.uk/2012/03/how-to-include-images-in-your-css/
			//	
			//	TODO: - obfuscation
			//	TODO:	- tokanize all code and text
			//	TODO:		- separate tokenizer for every file type
			//	TODO:		- don't tokenize and obfuscate readable text:
			//	TODO:			- free text in room files, @@DEFs, @@ONs etc
			//	TODO:			- json value text in room files
			//	TODO:			- free text in html and xhtml files: text attributes like input.value, free text
			//	TODO:			- UI strings in javascript files - provide a string wrapper function keep("some string") that prevents string obfuscation
			//	TODO:		- don't tokenize and obfuscate functional strings from external apis:
			//	TODO:			- css bodies
			//	TODO:			- xhtml, html style attribute values
			//	TODO:			- js style property and subproperties
			//	TODO:		- define an exclusion dictionary (tokens that will not be modified - all js keywords, dom methods, all html tags, all html attributes)
			//	TODO:	- build a token dictionary
			//	TODO:	- map all tokens from the token dictionary that are not on the exclusion dictionary to obfuscated values; use the obfuscated tokens when building
			//	TODO:		the release output
		}

		void Log(string level, string text, DateTime dateTime = default(DateTime))
		{
			if (dateTime == default(DateTime))
			{
				dateTime = DateTime.Now;
			}
			this.buildLogTextBox.AppendText(string.Format("[{0}] {1}: {2}{3}", dateTime.ToString("yyyyMMdd-HHmmss-fff"), level, text, Environment.NewLine));
		}

		void Log(Exception ex)
		{
			this.buildLogTextBox.AppendText(ex.ToString());
			this.buildLogTextBox.AppendText(Environment.NewLine);
		}

		#endregion

		#region UI Event handlers

		void booksRootPathTextBox_TextChanged(object sender, EventArgs e)
		{
			if (this.uiEventsSuspendCount > 0)
			{
				return;
			}

			try
			{
				Settings.BooksRootPath = this.booksRootPathTextBox.Text;
				Settings.Save(ConfigurationFileName);
				this.UpdateBookList();
			}
			catch (Exception ex)
			{
				this.Log(ex);
			}
		}

		void bookCheckedListBox_ItemCheck(object sender, ItemCheckEventArgs e)
		{
			if (this.uiEventsSuspendCount > 0)
			{
				return;
			}

			try
			{
				List<string> checkedItems = new List<string>(this.bookCheckedListBox.CheckedItems.Cast<string>());
				switch (e.NewValue)
				{
					case CheckState.Unchecked:
						checkedItems.Remove((string)this.bookCheckedListBox.Items[e.Index]);
						break;
					case CheckState.Checked:
						checkedItems.Add((string)this.bookCheckedListBox.Items[e.Index]);
						break;
					default:
						throw new NotImplementedException();
				}
				Settings.SelectedBooks = checkedItems.ToArray();
				Settings.Save(ConfigurationFileName);
			}
			catch (Exception ex)
			{
				this.Log(ex);
			}
		}

		void buildButton_Click(object sender, EventArgs e)
		{
			if(this.uiEventsSuspendCount > 0)
			{
				return;
			}

			try
			{
				for (int length = this.bookCheckedListBox.CheckedItems.Count, i = 0; i < length; ++i)
				{
					var item = this.bookCheckedListBox.CheckedItems[i];
					this.Log("INFO", string.Format("Building: {0}", item));
					this.BuildBook((string)item);
				}
				this.Log("INFO", "Done.");
			}
			catch (Exception ex)
			{
				this.Log("ERROR", "Build failed!");
				this.Log(ex);
			}
		}

		int uiEventsSuspendCount = 0;

		#endregion
	}
}
