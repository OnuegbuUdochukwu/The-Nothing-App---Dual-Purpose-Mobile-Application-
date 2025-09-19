import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { listDoodles, deleteDoodle, DoodleEntry } from '@/utils/doodleGallery';
import { shareFile } from '@/utils/doodleExport';
import { Colors } from '@/constants/Colors';

type Props = {
  visible: boolean;
  onRequestClose: () => void;
};

export default function DoodleGallery({ visible, onRequestClose }: Props) {
  const [items, setItems] = useState<DoodleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await listDoodles();
      setItems(list);
    } catch (e) {
      console.warn('Failed to load doodle gallery', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) load();
  }, [visible]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete doodle', 'Permanently delete this doodle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoodle(id);
            await load();
          } catch (e) {
            console.warn('Failed to delete doodle', e);
          }
        },
      },
    ]);
  };

  const handleShare = async (uri: string) => {
    try {
      await shareFile(uri);
    } catch (e) {
      console.warn('Failed to share doodle', e);
      Alert.alert(
        'Share failed',
        'Unable to share this doodle on this device.'
      );
    }
  };

  const renderItem = ({ item }: { item: DoodleEntry }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setPreviewUri(item.pngUri)}>
        <Image
          source={{ uri: item.thumbnailUri || item.pngUri }}
          style={styles.thumb}
        />
      </TouchableOpacity>
      <View style={styles.meta}>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
        <View style={styles.rowActions}>
          <TouchableOpacity
            style={styles.action}
            onPress={() => handleShare(item.pngUri)}
          >
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.action}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={[styles.actionText, { color: Colors.common.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Doodles</Text>
          <TouchableOpacity onPress={onRequestClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.personal.accent}
            style={{ marginTop: 40 }}
          />
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No saved doodles yet.</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}

        <Modal
          visible={!!previewUri}
          transparent={true}
          onRequestClose={() => setPreviewUri(null)}
        >
          <View style={styles.previewContainer}>
            <TouchableOpacity
              style={styles.previewClose}
              onPress={() => setPreviewUri(null)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.previewImage} />
            ) : null}
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.personal.background,
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.personal.text,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: Colors.personal.accent,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.personal.surface,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: 6,
    backgroundColor: Colors.personal.border,
  },
  meta: {
    marginLeft: 12,
    flex: 1,
  },
  date: {
    color: Colors.personal.textSecondary,
    marginBottom: 8,
  },
  rowActions: {
    flexDirection: 'row',
  },
  action: {
    marginRight: 12,
  },
  actionText: {
    color: Colors.personal.accent,
  },
  empty: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.personal.textSecondary,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 20,
  },
  previewImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
    borderRadius: 8,
  },
});
