import React from 'react';
import { act, create } from 'react-test-renderer';
import { Text } from 'react-native';

import BlogFeedScreen from '../components/Screens/Blog/BlogFeedScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('BlogFeedScreen comment modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    AsyncStorage.getItem.mockResolvedValue('mock-token');

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
    });

    await act(async () => {
      await Promise.resolve();
    });

    const commentTextNode = renderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '1 Comments');

    expect(commentTextNode).toBeTruthy();

    await act(async () => {
      commentTextNode.parent.props.onPress();
    });

    await act(async () => {
      await Promise.resolve();
    });

    const modalTitle = renderer.root
      .findAllByType(Text)
      .find(node => node.props.children === 'Comments');

    expect(modalTitle).toBeTruthy();

    const existingComment = renderer.root
      .findAllByType(Text)
      .find(node => node.props.children === 'This is a comment');

    expect(existingComment).toBeTruthy();
  });
});
