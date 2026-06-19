<template>
  <div class="w-[420px] p-4 bg-gray-50 text-gray-800 font-sans flex flex-col max-h-[600px]">
    <div class="flex justify-between items-center mb-4 border-b pb-2 border-gray-200">
      <h1 class="text-xl font-bold text-green-700">autoGC</h1>
      <span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">v1.0.0</span>
    </div>

    <!-- 主界面：无本地配置 -->

    <!-- 开发者 / Debug 折叠区 -->
    <details class="border border-gray-200 rounded bg-white shadow-sm group" @toggle="onDebugToggle">
      <summary class="text-xs font-semibold text-gray-600 cursor-pointer outline-none p-3 select-none hover:bg-gray-100 flex justify-between items-center transition-colors">
        <span>🛠️ 开发者调试工具 (Debug)</span>
        <button @click.stop.prevent="refreshState" class="px-2 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-[10px]">
          刷新状态
        </button>
      </summary>
      
      <div class="p-3 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
        <!-- Global Error State -->
        <div v-if="pageStateError" class="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded text-xs flex gap-2 items-start shadow-sm font-medium">
          <span class="text-sm">⚠️</span>
          <div>
            <p class="font-bold">Extraction Warning</p>
            <p class="text-[10px] text-red-600 mt-0.5">{{ pageStateError }}</p>
          </div>
        </div>

        <!-- Data Panel (Tabbed View) -->
        <div v-if="pageState" class="flex flex-col gap-2">
          <!-- Tab Headers -->
          <div class="flex border-b border-gray-200 text-xs">
            <button 
              v-if="hasInfo || isCheckerPage"
              type="button"
              @click="activeTab = 'overview'" 
              :class="['px-3 py-1.5 font-medium border-b-2 focus:outline-none transition-colors', activeTab === 'overview' ? 'border-green-600 text-green-700 bg-white font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100']"
            >
              Overview
            </button>
            <button 
              v-if="hasInfo"
              type="button"
              @click="activeTab = 'metadata'" 
              :class="['px-3 py-1.5 font-medium border-b-2 focus:outline-none transition-colors', activeTab === 'metadata' ? 'border-green-600 text-green-700 bg-white font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100']"
            >
              Ext. Data
            </button>
            <button 
              v-if="hasInfo"
              type="button"
              @click="activeTab = 'lists'" 
              :class="['px-3 py-1.5 font-medium border-b-2 focus:outline-none transition-colors', activeTab === 'lists' ? 'border-green-600 text-green-700 bg-white font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100']"
            >
              Lists
            </button>
            <button 
              type="button"
              @click="activeTab = 'raw_json'" 
              :class="['px-3 py-1.5 font-medium border-b-2 focus:outline-none transition-colors', activeTab === 'raw_json' ? 'border-green-600 text-green-700 bg-white font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100']"
            >
              Raw JSON
            </button>
          </div>

          <!-- Tab Contents -->
          <div class="mt-1">
            <!-- 1. Overview Tab -->
            <div v-if="activeTab === 'overview' && hasInfo" class="text-[11px] space-y-1 bg-white p-2.5 rounded border border-gray-200 shadow-sm">
              <div class="grid grid-cols-3 py-1 border-b border-gray-100">
                <span class="font-semibold text-gray-500">GC Code</span>
                <span class="col-span-2 font-mono text-gray-900">{{ pageState.data?.info?.gcCode }}</span>
              </div>
              <div class="grid grid-cols-3 py-1 border-b border-gray-100">
                <span class="font-semibold text-gray-500">Cache Type</span>
                <span class="col-span-2 text-gray-900">{{ pageState.data?.info?.cacheType }}</span>
              </div>
              <div class="grid grid-cols-3 py-1 border-b border-gray-100">
                <span class="font-semibold text-gray-500">Difficulty</span>
                <span class="col-span-2 text-gray-900">{{ pageState.data?.info?.difficulty || 'N/A' }}</span>
              </div>
              <div class="grid grid-cols-3 py-1 border-b border-gray-100">
                <span class="font-semibold text-gray-500">Terrain</span>
                <span class="col-span-2 text-gray-900">{{ pageState.data?.info?.terrain || 'N/A' }}</span>
              </div>
              <div class="grid grid-cols-3 py-1 border-b border-gray-100">
                <span class="font-semibold text-gray-500">Owner</span>
                <span class="col-span-2 text-gray-900">
                  <a v-if="pageState.data?.info?.ownerLink" :href="pageState.data?.info?.ownerLink" target="_blank" class="text-blue-600 hover:underline">
                    {{ pageState.data?.info?.owner || 'N/A' }}
                  </a>
                  <span v-else>{{ pageState.data?.info?.owner || 'N/A' }}</span>
                </span>
              </div>
              <div class="grid grid-cols-3 py-1 border-b border-gray-100">
                <span class="font-semibold text-gray-500">Hidden Date</span>
                <span class="col-span-2 text-gray-900">{{ pageState.data?.info?.hiddenDate || 'N/A' }}</span>
              </div>
              <div class="flex flex-col pt-1">
                <span class="font-semibold text-gray-500 mb-0.5">Personal Note</span>
                <span class="text-gray-700 bg-gray-50 p-1.5 rounded border border-gray-200 max-h-20 overflow-y-auto whitespace-pre-wrap leading-tight">
                  {{ pageState.data?.info?.note || '(Empty)' }}
                </span>
              </div>
            </div>

            <!-- Checker Overview Tab -->
            <div v-if="activeTab === 'overview' && isCheckerPage" class="text-[11px] space-y-1 bg-white p-2.5 rounded border border-gray-200 shadow-sm">
              <div class="grid grid-cols-3 py-1 border-b border-gray-100">
                <span class="font-semibold text-gray-500">Checker Type</span>
                <span class="col-span-2 font-bold text-gray-900 capitalize">{{ pageState.data?.checkerType || 'Unknown' }}</span>
              </div>
              <div class="grid grid-cols-3 py-1 border-b border-gray-100" v-if="pageState.data?.gcCode">
                <span class="font-semibold text-gray-500">GC Code</span>
                <span class="col-span-2 font-mono text-gray-900 font-bold">{{ pageState.data?.gcCode }}</span>
              </div>
              <div class="grid grid-cols-3 py-1 border-b border-gray-100">
                <span class="font-semibold text-gray-500">Page Title</span>
                <span class="col-span-2 text-gray-900 truncate" :title="pageState.data?.title">{{ pageState.data?.title || 'N/A' }}</span>
              </div>
              <div class="grid grid-cols-3 py-1 border-b border-gray-100">
                <span class="font-semibold text-gray-500">URL</span>
                <span class="col-span-2 text-gray-900 truncate">
                  <a :href="pageState.data?.url" target="_blank" class="text-blue-600 hover:underline">
                    {{ pageState.data?.url }}
                  </a>
                </span>
              </div>
              <div class="grid grid-cols-3 py-1 border-b border-gray-100" v-if="pageState.data?.checkerType === 'geocheck'">
                <span class="font-semibold text-gray-500">Needs CAPTCHA</span>
                <span class="col-span-2 font-medium" :class="pageState.data?.hasCaptcha ? 'text-amber-600' : 'text-green-600'">
                  {{ pageState.data?.hasCaptcha ? 'Yes ⚠️' : 'No' }}
                </span>
              </div>
              <div class="grid grid-cols-3 py-1">
                <span class="font-semibold text-gray-500">Status</span>
                <span class="col-span-2 font-bold">
                  <span v-if="pageState.data?.solved" class="text-green-600">🟢 Solved (Correct Coordinates)</span>
                  <span v-else-if="pageState.data?.failed" class="text-red-600">🔴 Failed / Incorrect</span>
                  <span v-else class="text-amber-500">🟡 Ready (Not Checked)</span>
                </span>
              </div>
            </div>

            <!-- 2. Ext. Data Tab -->
            <div v-if="activeTab === 'metadata' && hasInfo" class="text-[11px] space-y-2.5 bg-white p-2.5 rounded border border-gray-200 shadow-sm">
              <div>
                <span class="font-semibold text-gray-500 block mb-1">Attributes</span>
                <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto" v-if="pageState.data?.info?.attributes && pageState.data?.info?.attributes.length > 0">
                  <span v-for="attr in pageState.data?.info?.attributes" :key="attr" class="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded text-[9px] font-medium">
                    {{ attr }}
                  </span>
                </div>
                <div v-else class="text-gray-400 italic">No attributes found.</div>
              </div>
              
              <div class="grid grid-cols-3 py-1 border-b border-gray-100">
                <span class="font-semibold text-gray-500">Favorite Points</span>
                <span class="col-span-2 text-gray-900 flex items-center gap-1 font-bold text-red-600">
                  ❤️ {{ pageState.data?.info?.favoritePoints }}
                </span>
              </div>
              
              <div class="flex flex-col pt-1">
                <span class="font-semibold text-gray-500 mb-0.5">Description (HTML)</span>
                <div class="text-gray-700 bg-gray-50 p-1.5 rounded border border-gray-200 max-h-32 overflow-y-auto text-[10px] break-words [&>img]:max-w-full" v-html="pageState.data?.info?.description || '<span class=\'italic text-gray-400\'>(Empty)</span>'">
                </div>
              </div>


            </div>

            <!-- 3. Lists Tab -->
            <div v-if="activeTab === 'lists' && hasInfo" class="text-[11px] space-y-3 bg-white p-2.5 rounded border border-gray-200 shadow-sm max-h-48 overflow-y-auto">
              <!-- Trackables -->
              <div>
                <span class="font-semibold text-gray-500 block border-b border-gray-100 pb-0.5 mb-1">Trackables Inventory</span>
                <ul class="list-disc pl-4 space-y-0.5" v-if="pageState.data?.info?.tbInventory && pageState.data?.info?.tbInventory.length > 0">
                  <li v-for="tb in pageState.data?.info?.tbInventory" :key="tb.name">
                    <a :href="tb.link" target="_blank" class="text-blue-600 hover:underline">{{ tb.name }}</a>
                  </li>
                </ul>
                <div v-else class="text-gray-400 italic pl-1">No trackables inside this cache.</div>
              </div>

              <!-- Bookmarks -->
              <div>
                <span class="font-semibold text-gray-500 block border-b border-gray-100 pb-0.5 mb-1">Bookmarks</span>
                <ul class="list-disc pl-4 space-y-0.5" v-if="pageState.data?.info?.bookmarks && pageState.data?.info?.bookmarks.length > 0">
                  <li v-for="bm in pageState.data?.info?.bookmarks" :key="bm.name">
                    <a :href="bm.link" target="_blank" class="text-blue-600 hover:underline">{{ bm.name }}</a>
                    <span class="text-gray-400 text-[9px]"> (by {{ bm.user }})</span>
                  </li>
                </ul>
                <div v-else class="text-gray-400 italic pl-1">No bookmark lists.</div>
              </div>

              <!-- My Bookmarks -->
              <div>
                <span class="font-semibold text-gray-500 block border-b border-gray-100 pb-0.5 mb-1">My Bookmarks</span>
                <ul class="list-disc pl-4 space-y-0.5" v-if="pageState.data?.info?.myBookmarks && pageState.data?.info?.myBookmarks.length > 0">
                  <li v-for="mbm in pageState.data?.info?.myBookmarks" :key="mbm.name">
                    <a :href="mbm.link" target="_blank" class="text-blue-600 hover:underline">{{ mbm.name }}</a>
                  </li>
                </ul>
                <div v-else class="text-gray-400 italic pl-1">Not in any of my bookmark lists.</div>
              </div>

              <!-- Hint -->
              <div>
                <span class="font-semibold text-gray-500 block border-b border-gray-100 pb-0.5 mb-1">Hint</span>
                <div v-if="pageState.data?.info?.hint" class="bg-amber-50 text-amber-800 p-1.5 rounded border border-amber-200 font-mono text-[10px] whitespace-pre-wrap break-words">
                  {{ pageState.data?.info?.hint }}
                </div>
                <div v-else class="text-gray-400 italic pl-1">No hint provided.</div>
              </div>

              <!-- Logs -->
              <div>
                <span class="font-semibold text-gray-500 block border-b border-gray-100 pb-0.5 mb-1">Recent Logs</span>
                <div v-if="pageState.data?.info?.logs && pageState.data?.info?.logs.length > 0" class="space-y-1.5">
                  <div v-for="(log, idx) in pageState.data?.info?.logs" :key="idx" class="bg-gray-50 p-1.5 rounded border border-gray-200">
                    <div class="flex justify-between font-semibold text-gray-500 text-[10px] mb-0.5">
                      <span>User: {{ log.user }}</span>
                      <span v-if="log.date" class="text-gray-400 font-normal">{{ log.date }}</span>
                    </div>
                    <div class="flex items-center gap-1 mb-1">
                      <span class="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 border border-blue-200 rounded font-semibold">Type: {{ log.type }}</span>
                    </div>
                    <p class="text-gray-700 leading-tight whitespace-pre-wrap text-[10px] mb-1">{{ log.text }}</p>
                    <div v-if="log.images && log.images.length > 0" class="flex flex-col gap-1 mt-1 border-t border-gray-200 pt-1.5">
                      <div v-for="(img, i) in log.images" :key="i" class="flex items-center gap-1">
                        <span class="text-[10px]">📷</span>
                        <a :href="img.link" target="_blank" class="text-[10px] text-blue-600 hover:underline truncate max-w-[200px]">{{ img.text || 'Image' }}</a>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-gray-400 italic pl-1">No logs available.</div>
              </div>
            </div>

            <!-- 4. Raw JSON Tab -->
            <div v-if="activeTab === 'raw_json'" class="overflow-auto bg-slate-900 border-slate-700 border text-[10px] rounded p-2.5 max-h-48 shadow-inner font-mono text-slate-300">
              <pre v-html="formatJsonToHtml(pageState)"></pre>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-400 italic text-xs">Waiting for data... Click refresh.</div>

        <!-- Actions Panel -->
        <div class="flex flex-col gap-2 border-t pt-2">
          <select v-model="selectedAction" class="w-full border border-gray-300 rounded p-1.5 text-xs outline-none focus:border-green-500 bg-white">
            <option value="" disabled>-- 调试操作 --</option>
            <option v-for="act in availableActions" :key="act.value" :value="act.value">
              {{ act.label }}
            </option>
          </select>

          <!-- Action Payload Inputs -->
          <input v-if="selectedAction === 'DEBUG_WRITE_NOTE'" type="text" v-model="noteText" class="w-full border border-gray-300 rounded p-1.5 text-xs outline-none focus:border-green-500 bg-white" placeholder="输入 Note 内容..." />
          <div v-if="selectedAction === 'DEBUG_FILL_CHECKER'" class="flex flex-col gap-2">
            <input type="text" v-model="checkerSolution" class="w-full border border-gray-300 rounded p-1.5 text-xs outline-none focus:border-green-500 bg-white" placeholder="输入 Checker 解答..." />
            <div v-if="pageState?.data?.hasCaptcha" class="flex items-center gap-2">
              <img v-if="pageState.data.captchaBase64" :src="pageState.data.captchaBase64" alt="Captcha" class="h-8 border border-gray-300 rounded" />
              <span v-else class="text-[10px] text-gray-500 italic">No image data</span>
              <input type="text" v-model="captchaText" class="w-full border border-gray-300 rounded p-1.5 text-xs outline-none focus:border-green-500 bg-white" placeholder="输入验证码..." />
            </div>
          </div>
          <input v-if="selectedAction === 'UPDATE_COORDS'" type="text" v-model="coordsText" class="w-full border border-gray-300 rounded p-1.5 text-xs outline-none focus:border-green-500 bg-white" placeholder="输入坐标 (例: N 12° 34.567 E 089° 12.345)..." />

          <button @click="executeAction" class="w-full bg-gray-700 text-white px-2 py-1.5 rounded text-xs font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors" :disabled="isActionDisabled">
            执行调试指令
          </button>
          
          <div v-if="actionResult" :class="[
            'p-2.5 rounded text-[10px] font-mono border mt-1 break-all max-h-20 overflow-auto shadow-inner',
            actionResult.includes('Error') || actionResult.includes('error') ? 'bg-red-50 text-red-700 border-red-200 font-semibold' : 
            (actionResult.includes('successfully') || actionResult.includes('accepted') || actionResult.includes('filled') ? 'bg-green-50 text-green-700 border-green-200 font-semibold' : 'bg-slate-100 text-slate-700 border-slate-200')
          ]">
            <span class="font-bold">> Result:</span> {{ actionResult }}
          </div>
        </div>
        
        <div v-if="pageState?.data?.solvedCoords || pageState?.data?.solvedImageUrl || pageState?.data?.solvedMessage" class="mt-2 text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">
          <div v-if="pageState?.data?.solvedCoords" class="mb-1">
            <strong>解开的坐标: </strong>
            <span class="font-mono text-green-700">{{ pageState?.data?.solvedCoords }}</span>
          </div>
          <div v-if="pageState?.data?.solvedMessage" class="mb-1 text-gray-600 italic border-l-2 border-gray-300 pl-2">
            "{{ pageState?.data?.solvedMessage }}"
          </div>
          <div v-if="pageState?.data?.solvedImageUrl" class="mt-2">
            <a :href="pageState?.data?.solvedImageUrl" target="_blank" title="点击查看大图">
              <img :src="pageState?.data?.solvedImageUrl" class="max-w-full h-auto max-h-32 border border-gray-300 rounded cursor-pointer hover:opacity-90" alt="Solved Image" />
            </a>
          </div>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { GCInfo, CheckerData } from './types';

interface PageState {
  success: boolean;
  type?: string;
  data?: {
    info?: GCInfo;
    checkers?: CheckerData[];
    // Checker-specific properties
    url?: string;
    checkerType?: string;
    title?: string;
    solved?: boolean;
    failed?: boolean;
    hasCaptcha?: boolean;
    captchaBase64?: string | null;
    solvedCoords?: string | null;
    solvedImageUrl?: string | null;
    solvedMessage?: string | null;
    gcCode?: string | null;
  };
  actions?: string[];
  error?: string;
  message?: string;
}

const pageState = ref<PageState | null>(null);
const selectedAction = ref<string>('');
const actionResult = ref<string>('');
const noteText = ref<string>('');
const checkerSolution = ref('');
const captchaText = ref('');
const coordsText = ref('N 12° 34.567 E 089° 12.345');
const activeTab = ref<'overview' | 'metadata' | 'lists' | 'raw_json'>('overview');

// Automatically set default tab based on data availability
watch(pageState, (newState) => {
  if (newState && newState.success && (newState.data?.info || newState.type === 'Certitude Page' || newState.type === 'GeoCheck Page')) {
    activeTab.value = 'overview';
  } else {
    activeTab.value = 'raw_json';
  }
});

const hasInfo = computed(() => {
  return !!(pageState.value && pageState.value.success && pageState.value.data && pageState.value.data.info);
});

const isCheckerPage = computed(() => {
  return !!(pageState.value && pageState.value.success && (pageState.value.type === 'Certitude Page' || pageState.value.type === 'GeoCheck Page'));
});

const pageStateError = computed(() => {
  if (!pageState.value) return null;
  if (pageState.value.error) return pageState.value.error;
  if (pageState.value.success === false) return pageState.value.message || 'Unknown error';
  // Check if we are on a detail page but have no info
  if (pageState.value.success && pageState.value.type === 'Geocache Detail Page' && !pageState.value.data?.info) {
    return 'Not on a Geocache Details Page. Please navigate to Geocaching.com cache page to inspect metadata.';
  }
  return null;
});

const isActionDisabled = computed(() => {
  if (!selectedAction.value) return true;
  if (selectedAction.value === 'DEBUG_WRITE_NOTE') return !noteText.value.trim();
  if (selectedAction.value === 'DEBUG_FILL_CHECKER') return !checkerSolution.value.trim();
  if (selectedAction.value === 'UPDATE_COORDS') return !coordsText.value.trim();
  return false;
});

const availableActions = computed(() => {
  if (!pageState.value || !pageState.value.actions) return [];
  return pageState.value.actions.map((act: string) => {
    let label = act;
    if (act === 'DEBUG_WRITE_NOTE') label = '✍️ 写入 Personal Note';
    if (act === 'DEBUG_FILL_CHECKER') label = '📝 填充 Checker';
    if (act === 'DEBUG_SUBMIT_CHECKER') label = '🚀 提交 Checker (Check)';
    if (act === 'UPDATE_COORDS') label = '📍 更新纠正坐标 (⚠️将刷新页面)';
    return { label, value: act };
  });
});

const sendToContentScript = async (action: string, payload?: any) => {
  // @ts-ignore
  if (typeof chrome === 'undefined' || !chrome.tabs) return { error: "No chrome extension context" };
  // @ts-ignore
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    return new Promise((resolve) => {
      // @ts-ignore
      chrome.tabs.sendMessage(tab.id, { action, payload }, (response) => {
        resolve(response || { error: "No response from content script." });
      });
    });
  }
  return { error: "No active tab." };
};

const refreshState = async () => {
  pageState.value = null;
  selectedAction.value = '';
  actionResult.value = '';
  const res = await sendToContentScript('GET_PAGE_STATE');
  pageState.value = res as PageState;
};

const onDebugToggle = (e: Event) => {
  const details = e.target as HTMLDetailsElement;
  if (details.open) {
    refreshState();
  }
};

const executeAction = async () => {
  actionResult.value = 'Executing...';
  let payload: any = {};
  if (selectedAction.value === 'DEBUG_WRITE_NOTE') {
    payload = { text: noteText.value };
  } else if (selectedAction.value === 'DEBUG_FILL_CHECKER') {
    payload = { 
      solution: checkerSolution.value,
      captcha: captchaText.value 
    };
  } else if (selectedAction.value === 'UPDATE_COORDS') {
    payload = { coords: coordsText.value };
  }
  
  const res: any = await sendToContentScript(selectedAction.value, payload);
  if (res && typeof res === 'object') {
    if (res.error) {
      actionResult.value = `Error: ${res.error}`;
    } else if (res.message) {
      actionResult.value = res.message;
    } else {
      actionResult.value = JSON.stringify(res);
    }
  } else {
    actionResult.value = String(res);
  }
};

// Pretty JSON tokenizer for Tailwind styling
const formatJsonToHtml = (jsonObj: any): string => {
  if (jsonObj === null || jsonObj === undefined) return '';
  const jsonStr = JSON.stringify(jsonObj, null, 2);
  const escaped = jsonStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\],])/g;
  
  return escaped.replace(regex, (match) => {
    let cls = 'text-slate-400';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'text-sky-400 font-semibold';
      } else {
        cls = 'text-emerald-400';
      }
    } else if (/true|false/.test(match)) {
      cls = 'text-amber-400 font-mono';
    } else if (/null/.test(match)) {
      cls = 'text-amber-400 font-mono';
    } else if (/\d+/.test(match)) {
      cls = 'text-amber-400 font-mono';
    }
    return `<span class="${cls}">${match}</span>`;
  });
};
</script>

<style>
body { margin: 0; padding: 0; }
details > summary::marker {
  color: #16a34a;
}
</style>
