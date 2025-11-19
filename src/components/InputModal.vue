<template>
  <div v-if="visible" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="modal-close" @click="handleClose">
          <i :class="closeIcon" />
        </button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">{{ inputLabel }}</label>
          <input
            ref="inputRef"
            v-model="inputValue"
            type="url"
            class="form-input"
            :placeholder="placeholder"
            @keydown.enter="handleSubmit"
            @keydown.escape="handleClose"
          />
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p v-if="helperText" class="helper-text">{{ helperText }}</p>
        </div>
        
        <div v-if="showTypeSelector" class="form-group">
          <label class="form-label">Media Type</label>
          <div class="type-selector">
            <button
              v-for="type in mediaTypes"
              :key="type.value"
              :class="['type-btn', { active: selectedType === type.value }]"
              @click="selectedType = type.value"
            >
              <i :class="type.icon" class="type-icon" />
              <span class="type-label">{{ type.label }}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleClose">
          Cancel
        </button>
        <button class="btn btn-primary" @click="handleSubmit" :disabled="!inputValue">
          {{ submitLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue';
import { detectMediaType, isValidUrl } from '../utils/nodeTypes';
import { ICONS } from '../utils/icons';

export default {
  name: 'InputModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Enter URL',
    },
    inputLabel: {
      type: String,
      default: 'URL',
    },
    placeholder: {
      type: String,
      default: 'https://example.com/...',
    },
    submitLabel: {
      type: String,
      default: 'Add',
    },
    helperText: {
      type: String,
      default: '',
    },
    initialValue: {
      type: String,
      default: '',
    },
    showTypeSelector: {
      type: Boolean,
      default: false,
    },
    initialType: {
      type: String,
      default: 'image',
    },
  },
  emits: ['submit', 'close'],
  setup(props, { emit }) {
    //#region State
    const inputRef = ref(null);
    const inputValue = ref('');
    const selectedType = ref('image');
    const errorMessage = ref('');
    
    const mediaTypes = [
      { value: 'image', label: 'Image', icon: ICONS.media },
      { value: 'video', label: 'Video', icon: ICONS.web },
      { value: 'pdf', label: 'PDF', icon: ICONS.textNote },
    ];
    
    const closeIcon = ICONS.delete;
    //#endregion

    //#region Watchers
    watch(() => props.visible, (newVisible) => {
      if (newVisible) {
        inputValue.value = props.initialValue || '';
        selectedType.value = props.initialType || 'image';
        errorMessage.value = '';
        
        // Auto-focus input
        nextTick(() => {
          inputRef.value?.focus();
        });
      }
    });

    // Auto-detect media type from URL
    watch(inputValue, (newUrl) => {
      if (props.showTypeSelector && newUrl) {
        const detectedType = detectMediaType(newUrl);
        selectedType.value = detectedType;
      }
      errorMessage.value = '';
    });
    //#endregion

    //#region Methods
    const handleSubmit = () => {
      const url = inputValue.value?.trim();
      
      if (!url) {
        errorMessage.value = 'URL is required';
        return;
      }
      
      if (!isValidUrl(url)) {
        errorMessage.value = 'Please enter a valid URL starting with http:// or https://';
        return;
      }
      
      emit('submit', {
        url,
        type: props.showTypeSelector ? selectedType.value : undefined,
      });
      
      handleClose();
    };

    const handleClose = () => {
      emit('close');
    };
    //#endregion

    return {
      inputRef,
      inputValue,
      selectedType,
      errorMessage,
      mediaTypes,
      closeIcon,
      handleSubmit,
      handleClose,
    };
  },
};
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  i {
    line-height: 1;
    transition: color 0.2s ease;
  }
  
  &:hover {
    background: #f5f5f5;
    color: #333;
    
    i {
      color: #333;
    }
  }
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007aff;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
  }
}

.error-message {
  margin-top: 8px;
  font-size: 13px;
  color: #ff3b30;
}

.helper-text {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}

.type-selector {
  display: flex;
  gap: 8px;
}

.type-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: white;
  border: 2px solid #d0d0d0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007aff;
    background: #f5f5f5;
  }
  
  &.active {
    border-color: #007aff;
    background: rgba(0, 122, 255, 0.05);
  }
}

.type-icon {
  font-size: 24px;
  line-height: 1;
  color: inherit;
}

.type-label {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-secondary {
  background: white;
  border: 1px solid #d0d0d0;
  color: #333;
  
  &:hover:not(:disabled) {
    background: #f5f5f5;
  }
}

.btn-primary {
  background: #007aff;
  color: white;
  
  &:hover:not(:disabled) {
    background: #0066dd;
  }
}
</style>
