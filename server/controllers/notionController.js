const { NotionAPI } = require('notion-sdk'); // Assuming you're using a Notion SDK or API wrapper
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const NotionPreference = require('../models/NotionPreference');

// Link Notion account (handle OAuth)
exports.linkNotionAccount = async (req, res) => {
  try {
    const { userId, notionUID, accessToken, workspaceId, workspaceName, email } = req.body;

    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update the user's Notion details
    user.notionUID = notionUID;
    user.notionAccessToken = accessToken;
    user.notionWorkspaceId = workspaceId;
    user.notionWorkspaceName = workspaceName;
    user.notionEmail = email;
    await user.save();

    res.status(200).json({ message: 'Notion account linked successfully' });
  } catch (error) {
    console.error('Error linking Notion account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unlink Notion account
exports.unlinkNotionAccount = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the user by their ID and remove the Notion details
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.notionUID = null;
    user.notionAccessToken = null;
    user.notionWorkspaceId = null;
    user.notionWorkspaceName = null;
    user.notionEmail = null;
    await user.save();

    res.status(200).json({ message: 'Notion account unlinked successfully' });
  } catch (error) {
    console.error('Error unlinking Notion account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Notion preferences
exports.getNotionPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('notionPreferences');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user.notionPreferences);
  } catch (error) {
    console.error('Error retrieving Notion preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update Notion preferences
exports.updateNotionPreferences = async (req, res) => {
  try {
    const { userId, notionPreferences } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.notionPreferences) {
      // Update existing preferences
      await NotionPreferences.findByIdAndUpdate(user.notionPreferences, notionPreferences);
    } else {
      // Create new preferences if none exist
      const newNotionPreferences = new NotionPreferences(notionPreferences);
      await newNotionPreferences.save();
      user.notionPreferences = newNotionPreferences._id;
      await user.save();
    }

    res.status(200).json({ message: 'Notion preferences updated successfully' });
  } catch (error) {
    console.error('Error updating Notion preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export conversation to Notion
exports.exportConversationToNotion = async (req, res) => {
  try {
    const { userId, conversationId } = req.body;

    // Fetch the user, their Notion preferences, and their Notion access token
    const user = await User.findById(userId).populate('notionPreferences');
    if (!user || !user.notionPreferences || !user.notionAccessToken) {
      return res.status(400).json({ error: 'Notion preferences or access token not set' });
    }

    // Fetch the conversation to be exported
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const { notionPreferences } = user;
    const { exportType, chunkSize, partNamingConvention, formatType, folderLocation, tags, databaseFields } = notionPreferences;

    // Divide the conversation into chunks based on the user's chunk size preference
    const conversationChunks = chunkConversation(conversation.content, chunkSize);

    // Process and export each chunk based on user's export preferences (Page or Database)
    for (let i = 0; i < conversationChunks.length; i++) {
      const chunk = conversationChunks[i];
      const chunkTitle = `${partNamingConvention}${i + 1}`;

      if (exportType === 'Page') {
        // Export chunk as a Notion Page
        await exportToNotionPage(user, chunk, chunkTitle, folderLocation, tags, formatType, notionPreferences);
      } else if (exportType === 'Database') {
        // Export chunk as a Notion Database Entry
        await exportToNotionDatabase(user, chunk, chunkTitle, databaseFields, formatType, notionPreferences);
      }
    }

    res.status(200).json({ message: 'Conversation exported to Notion successfully' });
  } catch (error) {
    console.error('Error exporting conversation to Notion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to chunk conversation content
function chunkConversation(content, chunkSize) {
  const chunks = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  return chunks;
}

// Helper function to export conversation as a Notion Page
async function exportToNotionPage(user, chunk, title, folderLocation, tags, formatType, notionPreferences) {
  const notionClient = new NotionAPI({ auth: user.notionAccessToken });

  // Format the content based on the user's preferences
  const formattedContent = formatContent(chunk, formatType, notionPreferences);

  // Create a new Notion page
  await notionClient.pages.create({
    parent: { type: 'page_id', page_id: folderLocation }, // Save to the specified folder location
    properties: {
      title: [{ type: 'text', text: { content: title } }],
      tags: tags.map(tag => ({ name: tag })),
    },
    content: formattedContent,
  });
}

// Helper function to export conversation as a Notion Database Entry
async function exportToNotionDatabase(user, chunk, title, databaseFields, formatType, notionPreferences) {
  const notionClient = new NotionAPI({ auth: user.notionAccessToken });

  // Format the content based on the user's preferences
  const formattedContent = formatContent(chunk, formatType, notionPreferences);

  // Create a new Notion database entry
  const properties = {
    title: [{ type: 'text', text: { content: title } }],
  };

  // Add optional fields like Date, User ID, Conversation Content, and custom fields
  if (databaseFields.date) properties.date = { type: 'date', date: { start: new Date() } };
  if (databaseFields.userID) properties.userID = { type: 'text', text: { content: user._id.toString() } };
  if (databaseFields.conversationContent) properties.conversationContent = { type: 'text', text: { content: formattedContent } };
  databaseFields.customFields.forEach(field => {
    properties[field] = { type: 'text', text: { content: chunk[field] || '' } };
  });

  await notionClient.databases.create({
    parent: { type: 'database_id', database_id: notionPreferences.databaseId }, // Save to the specified database
    properties,
  });
}

// Helper function to format content
function formatContent(chunk, formatType, notionPreferences) {
  if (formatType === 'Plain Text') {
    return chunk; // Return the plain text
  }

  // Format as rich text (add headings, code blocks, collapsible sections, etc.)
  let formattedContent = chunk.map(entry => {
    if (entry.type === 'query') {
      return notionPreferences.includeHeadings ? `## ${entry.content}` : entry.content;
    } else if (entry.type === 'response') {
      return notionPreferences.includeCodeBlocks ? `\`\`\`\n${entry.content}\n\`\`\`` : entry.content;
    }
    return entry.content;
  });

  if (notionPreferences.collapsibleSections) {
    // Apply collapsible sections logic here
    formattedContent = `> [Toggle]: ${formattedContent}`;
  }

  return formattedContent;
}