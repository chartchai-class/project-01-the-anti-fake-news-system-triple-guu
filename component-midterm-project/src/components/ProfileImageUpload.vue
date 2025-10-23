<template>
  <div>
    <input type="file" accept="image/*" @change="onFileChange" />
    <div v-if="previewUrl" class="mt-2">
      <img :src="previewUrl" alt="Preview" class="w-24 h-24 rounded-full object-cover border-2 border-blue-500" />
    </div>
    <button v-if="selectedFile" class="mt-2 bg-blue-600 text-white px-4 py-2 rounded" @click="uploadImage">Upload</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['uploaded'])
const selectedFile = ref<File|null>(null)
const previewUrl = ref<string|null>(null)

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    previewUrl.value = URL.createObjectURL(selectedFile.value)
  }
}

async function uploadImage() {
  if (!selectedFile.value) return
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('jwt')
  if (!userId || !token) {
    alert('Not authenticated')
    return
  }
  const response = await fetch(`/api/v1/users/${userId}/profile-image`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (response.ok) {
    emit('uploaded')
  } else {
    alert('Upload failed')
  }
}
</script>

<style scoped>
</style>
