import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

interface IFormSubmitData {
  title: string;
  description: string;
  url: string;
}

const MAX_FILE_SIZE = 1000000;

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      required: 'Arquivo obrigatório',
      validate: {
        lessThan10MB: fileList =>
          fileList[0].size < MAX_FILE_SIZE ||
          'O arquivo deve ser menor que 10MB',
        acceptedFormats: v =>
          /image\/(jpeg|png|gif)/.test(v[0].type) ||
          'Somente são aceitos arquivos PNG, JPEG e GIF',
      },
    },
    title: {
      required: 'Título obrigatório',
      minLength: 'Mínimo de 2 caracteres',
      maxLength: 'Máximo de 20 caracteres',
    },
    description: {
      required: 'Descrição obrigatória',
      maxLength: 'Máximo de 65 caracteres',
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(async (data: IFormSubmitData): Promise<any>  => {
      const response = await api.post('images', data);
      return response.data;
    },
    { onSuccess: () => queryClient.invalidateQueries('images') }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors } = formState;

  const onSubmit = async (data: Record<string, unknown>): Promise<void> => {
    try {
      if (!imageUrl) {
        toast({
          status:'error',
          title: 'Imagem não adicionada',
          description: `É preciso adicionar e aguardar o upload de uma imagem 
            antes de realizar o cadastro`,
          isClosable: true
        });
        return;
      }
      await mutation.mutateAsync({ ...data, url: imageUrl });

      toast({
        status: 'success',
        title: 'Imagem cadastrada',
        description: 'Sua imagem foi cadastrada com sucesso',
      });
    } catch (ex) {
      console.log(ex);
      toast({
        status:'error',
        title: 'Falha no cadastro',
        description: 'Ocorreu um erro ao tentar cadastrar a sua imagem',
        isClosable: true
      });
    } finally {
      reset();  
      setLocalImageUrl('');
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image}
          {...register('image', formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          error={errors.title}
          {...register('title', formValidations.title)}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          error={errors.description}
          {...register('description', formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
