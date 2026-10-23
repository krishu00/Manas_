import React from 'react';
import { act, create } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';

import BlogFeedScreen from '../components/Screens/Blog/BlogFeedScreen';
import axios from 'axios';
import { getAuthToken, getBlogAuthSession } from '../src/utils/auth';
import { getCommentAuthorName } from '../components/Screens/Blog/CommentItem';

jest.mock('../src/utils/auth', () => ({
  getAuthToken: jest.fn(),
  getBlogAuthSession: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useRoute: jest.fn(() => ({ params: {} })),
}));

jest.mock('../components/common/AppHeader', () => () => null);

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
      },
      post: jest.fn(),
    })),
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('BlogFeedScreen comment modal', () => {
  const flushAsync = () => new Promise(resolve => setImmediate(resolve));
  const storage = new Map();
  const findText = (renderer, expectedText) =>
    renderer.root.findAllByType(Text).find(node => {
      const text = Array.isArray(node.props.children)
        ? node.props.children.join('')
        : node.props.children;

      return text === expectedText;
    });
  const findPressable = node => {
    let current = node;

    while (current && typeof current.props.onPress !== 'function') {
      current = current.parent;
    }

    return current;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    storage.clear();

    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockImplementation(async key => storage.get(key) || null);
    AsyncStorage.setItem.mockImplementation(async (key, value) => {
      storage.set(key, value);
    });

    getAuthToken.mockResolvedValue('guest-token');
    getBlogAuthSession.mockResolvedValue({
      isAuthenticated: true,
      accountType: 'guest',
      token: 'guest-token',
    });

    axios.get.mockImplementation(url => {
      if (url.includes('/blog/all')) {
        return Promise.resolve({
          data: {
            blogs: [
              {
                _id: 'b1',
                title: 'Test Blog',
                description: 'This is a test blog',
                authorName: 'Sam',
                createdAt: '2024-01-01T00:00:00Z',
                likesCount: 4,
                commentsCount: 1,
                sharesCount: 0,
                image: '',
              },
            ],
          },
        });
      }

      if (url.includes('/blog/b1/comments')) {
        return Promise.resolve({
          data: {
            data: [
              {
                _id: 'c1',
                content: 'This is a comment',
                author: { name: 'Sam' },
                createdAt: '2024-01-01T00:00:00Z',
              },
            ],
          },
        });
      }

      return Promise.resolve({ data: {} });
    });

    axios.post.mockResolvedValue({
      data: {
        success: true,
        message: 'Comment added successfully',
        commentsCount: 2,
      },
    });
  });

  it('shows loaded comments in the comment popup when opening comments', async () => {
    let renderer;

    await act(async () => {
      renderer = create(
        <BlogFeedScreen navigation={{ navigate: jest.fn() }} />,
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await flushAsync();
    });

    await act(async () => {
      await Promise.resolve();
    });

    const commentTextNode = findText(renderer, '1 Comments');

    expect(commentTextNode).toBeTruthy();

    await act(async () => {
      findPressable(commentTextNode).props.onPress();
    });

    await act(async () => {
      await Promise.resolve();
    });

    const modalTitle = findText(renderer, 'Comments');

    expect(modalTitle).toBeTruthy();

    const existingComment = findText(renderer, 'This is a comment');

    expect(existingComment).toBeTruthy();

    await act(async () => {
      renderer.unmount();
    });
  });

  it('resolves guest and employee comment author names', () => {
    expect(
      getCommentAuthorName({
        authorType: 'guest',
        guestAuthor: { name: 'Guest Krishna' },
      }),
    ).toBe('Guest Krishna');
    expect(
      getCommentAuthorName({
        author: { employee_details: { name: 'Employee Krishna' } },
      }),
    ).toBe('Employee Krishna');
  });

  it('uses the guest token for a feed like without redirecting to Login', async () => {
    const navigation = { navigate: jest.fn() };
    let renderer;

    await act(async () => {
      renderer = create(<BlogFeedScreen navigation={navigation} />);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await flushAsync();
    });

    const likeText = findText(renderer, '4 Likes');

    await act(async () => {
      findPressable(likeText).props.onPress();
      await Promise.resolve();
    });

    expect(getBlogAuthSession).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/blog/b1/like'),
      {},
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer guest-token',
        }),
      }),
    );
    expect(navigation.navigate).not.toHaveBeenCalledWith('Login');

    await act(async () => {
      renderer.unmount();
    });
  });

  it('keeps a successfully liked blog active after loading the feed again', async () => {
    const navigation = { navigate: jest.fn() };
    let renderer;

    await act(async () => {
      renderer = create(<BlogFeedScreen navigation={navigation} />);
      await flushAsync();
    });

    const likeText = findText(renderer, '4 Likes');
    await act(async () => {
      findPressable(likeText).props.onPress();
      await flushAsync();
    });
    await act(async () => {
      renderer.unmount();
    });

    await act(async () => {
      renderer = create(<BlogFeedScreen navigation={navigation} />);
      await flushAsync();
    });

    expect(findText(renderer, '❤️')).toBeTruthy();

    await act(async () => {
      renderer.unmount();
    });
  });

  it('passes the resolved blog author to the detail screen', async () => {
    const navigation = { navigate: jest.fn() };
    let renderer;

    await act(async () => {
      renderer = create(<BlogFeedScreen navigation={navigation} />);
      await flushAsync();
    });

    const blogTitle = findText(renderer, 'Test Blog');

    await act(async () => {
      findPressable(blogTitle).props.onPress();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('BlogDetail', {
      blogId: 'b1',
      authorName: 'Sam',
    });

    await act(async () => {
      renderer.unmount();
    });
  });

  it('uses the guest token when posting a feed comment', async () => {
    const navigation = { navigate: jest.fn() };
    let renderer;

    await act(async () => {
      renderer = create(<BlogFeedScreen navigation={navigation} />);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await flushAsync();
    });

    const commentText = findText(renderer, '1 Comments');

    await act(async () => {
      findPressable(commentText).props.onPress();
      await Promise.resolve();
    });

    const input = renderer.root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('Guest comment');
    });

    const submitText = findText(renderer, 'Post Comment');

    await act(async () => {
      findPressable(submitText).props.onPress();
      await Promise.resolve();
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/blog/b1/comment'),
      { content: 'Guest comment' },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer guest-token',
        }),
      }),
    );
    expect(navigation.navigate).not.toHaveBeenCalledWith('Login');

    await act(async () => {
      renderer.unmount();
    });
  });
});
