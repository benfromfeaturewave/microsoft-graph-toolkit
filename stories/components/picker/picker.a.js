/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */

import { html } from 'lit';
import { withCodeEditor } from '../../../.storybook/addons/codeEditorAddon/codeAddon';

export default {
  title: 'Components / mgt-picker',
  component: 'mgt-picker',
  decorators: [withCodeEditor]
};

export const picker = () => html`
    <mgt-picker resource="me/todo/lists" scopes="tasks.read, tasks.readwrite" placeholder="Select a task list"></mgt-picker>
 `;

export const MaxPages = () => html`
<mgt-picker resource="me/todo/lists" scopes="tasks.read, tasks.readwrite" placeholder="Select a task list" max-pages="2"></mgt-picker>

`;
