"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const sikirinshotUrlFormSchema = z.object({
  url: z.string().url(),
});

const SikirinshotUrlInput = () => {
  const form = useForm<z.infer<typeof sikirinshotUrlFormSchema>>({
    resolver: zodResolver(sikirinshotUrlFormSchema),
    defaultValues: {
      url: "",
    },
  });

  function onSubmit(values: z.infer<typeof sikirinshotUrlFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center justify-center flex-col gap-1"
        >
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Try https://google.com" {...field} />
                </FormControl>
                <FormDescription>
                  Website URL that you want to take a screenshot of
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Sikirinshot!</Button>
        </form>
      </Form>
    </div>
  );
};
interface SignInDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SignInDialog = ({ open, setOpen }: SignInDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-96 flex items-center justify-center flex-col">
        <DialogHeader>
          <DialogTitle>Please sign in to continue</DialogTitle>
        </DialogHeader>
        <div>
          <Link href="/sign-in">
            <Button>Sign in / Sign up</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const [openUrlInput, setOpenUrlInput] = useState(false);

  const { user, isSignedIn } = useUser();

  const start = () => {
    if (!isSignedIn) {
      setOpen(true);
      return;
    }

    setOpenUrlInput(true);
  };

  return (
    <div>
      {isSignedIn ? (
        <header className="flex items-end justify-end p-2">
          <Link href="/my-profile">
            <Button variant="link">My Profile</Button>
          </Link>
        </header>
      ) : null}
      <div className="flex items-center justify-center pt-12">
        <div className="flex items-center justify-center flex-col">
          <SignInDialog open={open} setOpen={setOpen} />
          <Image
            src="/sikirinshot.png"
            alt="Sikirinshot!"
            width={500}
            height={500}
          />
          {openUrlInput ? (
            <SikirinshotUrlInput />
          ) : (
            <Button onClick={() => start()}>Start</Button>
          )}
        </div>
      </div>
    </div>
  );
}
